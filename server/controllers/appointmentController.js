/**
 * Appointment Controller
 * Handles booking, viewing, updating appointments.
 * Also manages doctor schedules and available time slots.
 */

const { v4: uuidv4 } = require('uuid');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const { calculateRiskScore } = require('../utils/aiRiskScore');

/**
 * @route   POST /api/appointments
 * @desc    Patient books an appointment with a doctor
 * @access  Private (patient)
 */
const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId, hospitalId, type, appointmentDate,
      timeSlot, symptoms,
    } = req.body;

    // Run AI risk assessment on the patient's symptoms
    const { score, level } = symptoms
      ? calculateRiskScore(symptoms, 0, 3)
      : { score: 0, level: 'low' };

    // Generate a unique room ID for the video call
    const videoRoomId = uuidv4();

    // Set the video call start time to match the appointment time
    const videoCallStartTime = new Date(appointmentDate);

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      hospital: hospitalId,
      type: type || 'normal',
      appointmentDate,
      timeSlot,
      symptoms,
      videoRoomId,
      videoCallStartTime,
      riskScore: score,
      riskLevel: level,
    });

    // Populate doctor and patient info for the response
    const populated = await appointment.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: populated,
    });
  } catch (error) {
    console.error('BookAppointment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/appointments
 * @desc    Get appointments for the logged-in user (patient sees their own, doctor sees theirs)
 * @access  Private
 */
const getMyAppointments = async (req, res) => {
  try {
    const { status, type } = req.query;

    // Build filter based on user role
    const filter = {};
    if (req.user.role === 'patient') {
      filter.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user.id;
    }
    // Admin sees all appointments (no filter)

    if (status) filter.status = status;
    if (type) filter.type = type;

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .populate('hospital', 'name city')
      .sort({ appointmentDate: -1 });

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error('GetMyAppointments error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/appointments/:id
 * @desc    Get details of a single appointment
 * @access  Private
 */
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .populate('hospital', 'name address city');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error('GetAppointmentById error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   PUT /api/appointments/:id/status
 * @desc    Doctor updates the status of an appointment (confirm, complete, cancel)
 * @access  Private (doctor)
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const validStatuses = ['confirmed', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;

    // If appointment is completed, record video call end time
    if (status === 'completed') {
      updateData.videoCallEndTime = new Date();

      // Increment doctor's total consultations count
      await DoctorProfile.findOneAndUpdate(
        { user: req.user.id },
        { $inc: { totalConsultations: 1 } }
      );
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.json({
      success: true,
      message: `Appointment status updated to "${status}".`,
      data: appointment,
    });
  } catch (error) {
    console.error('UpdateAppointmentStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/appointments/slots
 * @desc    Get available time slots for a doctor on a specific date
 * @access  Private
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'doctorId and date are required.' });
    }

    // Get doctor's schedule for the day of the week
    const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const requestedDate = new Date(date);
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., 'Monday'

    // Find the schedule for the requested day
    const daySchedule = doctorProfile.schedule.find((s) => s.day === dayName);

    if (!daySchedule) {
      return res.json({
        success: true,
        data: [],
        message: `Doctor is not available on ${dayName}.`,
      });
    }

    // Generate time slots from startTime to endTime
    const slots = generateTimeSlots(
      daySchedule.startTime,
      daySchedule.endTime,
      daySchedule.slotDuration || 30
    );

    // Find already booked slots for this doctor on this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'confirmed'] },
    });

    const bookedSlots = bookedAppointments.map((a) => a.timeSlot);

    // Mark each slot as available or booked
    const availableSlots = slots.map((slot) => ({
      slot,
      available: !bookedSlots.includes(slot),
    }));

    res.json({
      success: true,
      data: availableSlots,
      message: `Slots for ${dayName}, ${date}`,
    });
  } catch (error) {
    console.error('GetAvailableSlots error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * Helper: Generate time slots given start time, end time, and duration.
 * @param {string} startTime - e.g., "09:00"
 * @param {string} endTime - e.g., "17:00"
 * @param {number} duration - slot duration in minutes
 * @returns {string[]} Array of slot strings like ["09:00-09:30", "09:30-10:00"]
 */
const generateTimeSlots = (startTime, endTime, duration) => {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + duration <= endMinutes) {
    const slotStart = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;
    currentMinutes += duration;
    const slotEnd = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;
    slots.push(`${slotStart}-${slotEnd}`);
  }

  return slots;
};

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors, optionally filtered by hospital or specialization
 * @access  Public
 */
const getDoctors = async (req, res) => {
  try {
    const { hospitalId, specialization } = req.query;

    const filter = {};
    if (hospitalId) filter.hospital = hospitalId;
    if (specialization) filter.specialization = new RegExp(specialization, 'i');

    const doctors = await DoctorProfile.find(filter)
      .populate('user', 'name email')
      .populate('hospital', 'name city');

    res.json({ success: true, data: doctors });
  } catch (error) {
    console.error('GetDoctors error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/doctors/schedule (via appointment router)
 * @desc    Get the schedule of a specific doctor
 * @access  Private
 */
const getDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.query.doctorId || req.user.id;

    const profile = await DoctorProfile.findOne({ user: doctorId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    res.json({ success: true, data: profile.schedule });
  } catch (error) {
    console.error('GetDoctorSchedule error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   PUT /api/doctors/schedule
 * @desc    Doctor updates their own weekly schedule
 * @access  Private (doctor)
 */
const updateDoctorSchedule = async (req, res) => {
  try {
    const { schedule } = req.body;

    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({ success: false, message: 'Schedule must be an array.' });
    }

    const profile = await DoctorProfile.findOneAndUpdate(
      { user: req.user.id },
      { schedule },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    res.json({
      success: true,
      message: 'Schedule updated.',
      data: profile.schedule,
    });
  } catch (error) {
    console.error('UpdateDoctorSchedule error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getAvailableSlots,
  getDoctors,
  getDoctorSchedule,
  updateDoctorSchedule,
};
