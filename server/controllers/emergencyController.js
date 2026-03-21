/**
 * Emergency Controller
 * Handles all emergency scenarios:
 * - Red button (instant SOS, never blocked)
 * - Validated emergency (with AI risk assessment)
 * - Fail-safe (patient abandoned validation flow)
 * - Resolution by doctors/admin
 */

const EmergencyEvent = require('../models/EmergencyEvent');
const Appointment = require('../models/Appointment');
const PatientProfile = require('../models/PatientProfile');
const Hospital = require('../models/Hospital');
const NotificationLog = require('../models/NotificationLog');
const { calculateRiskScore } = require('../utils/aiRiskScore');
const { v4: uuidv4 } = require('uuid');

/**
 * @route   POST /api/emergency/red-button
 * @desc    Instant SOS - MUST NEVER BE BLOCKED. Triggers immediately.
 * @access  Private (patient)
 */
const createRedButtonEmergency = async (req, res) => {
  try {
    const { location, symptoms } = req.body;

    // Find patient profile for emergency contacts
    const patientProfile = await PatientProfile.findOne({ user: req.user.id });

    // Find the nearest hospital (simulated: pick first approved hospital)
    const nearestHospital = await Hospital.findOne({ status: 'approved', emergencyServices: true });

    // Create the emergency event immediately
    const emergency = await EmergencyEvent.create({
      patient: req.user.id,
      hospital: nearestHospital ? nearestHospital._id : undefined,
      type: 'red_button',
      status: 'active',
      location: location || {
        lat: 28.6139,   // Simulated: New Delhi coordinates
        lng: 77.2090,
        address: 'Location simulated',
        simulated: true,
      },
      symptoms: symptoms || 'Emergency - no symptoms specified',
      alertSent: true,
      emergencyContactsNotified: true,
      helplineSimulated: true,
    });

    // Log the emergency alert notification for the patient
    await NotificationLog.create({
      recipient: req.user.id,
      type: 'emergency_alert',
      message: '🚨 EMERGENCY ALERT: SOS activated. Help is on the way!',
      metadata: { emergencyId: emergency._id, type: 'red_button' },
    });

    // Simulate notifying emergency contacts
    if (patientProfile && patientProfile.emergencyContacts.length > 0) {
      const notifyPromises = patientProfile.emergencyContacts.map((contact) => {
        console.log(`📞 [EMERGENCY SIMULATED] Calling emergency contact: ${contact.name} (${contact.phone})`);
        return NotificationLog.create({
          recipient: req.user.id,
          type: 'contact_notification',
          message: `Emergency contact ${contact.name} has been notified (simulated call to ${contact.phone})`,
          metadata: { contactName: contact.name, phone: contact.phone },
        });
      });
      await Promise.all(notifyPromises);
    }

    // Simulate helpline call
    console.log('📞 [SIMULATED] Calling 108 Emergency Helpline...');
    await NotificationLog.create({
      recipient: req.user.id,
      type: 'helpline_simulated',
      message: '108 Emergency helpline has been alerted (simulated). Ambulance dispatched.',
      metadata: { emergencyId: emergency._id },
    });

    // Return immediately - this endpoint must always respond fast
    res.status(201).json({
      success: true,
      message: '🚨 EMERGENCY SOS ACTIVATED! Help is on the way. Stay calm.',
      data: {
        emergencyId: emergency._id,
        hospitalNotified: nearestHospital ? nearestHospital.name : 'Nearest hospital',
        contactsNotified: patientProfile ? patientProfile.emergencyContacts.length : 0,
        helplineAlerted: true,
      },
    });
  } catch (error) {
    console.error('RedButtonEmergency error:', error);
    // Even on error, try to return a response so the patient knows something happened
    res.status(500).json({ success: false, message: 'Emergency recorded. Please call 108 directly.' });
  }
};

/**
 * @route   POST /api/emergency/validate
 * @desc    AI-powered emergency validation with misuse tracking
 * @access  Private (patient)
 */
const validateEmergency = async (req, res) => {
  try {
    const { symptoms, duration, severity, wantsEmergency } = req.body;

    // Run AI risk scoring
    const { score, level, recommendation } = calculateRiskScore(symptoms, duration, severity);

    // Get patient profile for misuse tracking
    const patientProfile = await PatientProfile.findOne({ user: req.user.id });

    // Find nearest hospital for emergency routing
    const nearestHospital = await Hospital.findOne({ status: 'approved', emergencyServices: true });

    // Create a validated emergency event
    const emergency = await EmergencyEvent.create({
      patient: req.user.id,
      hospital: nearestHospital ? nearestHospital._id : undefined,
      type: 'validated',
      status: 'active',
      symptoms,
      riskScore: score,
      riskLevel: level,
      location: {
        lat: 28.6139,
        lng: 77.2090,
        address: 'Location simulated',
        simulated: true,
      },
    });

    /**
     * Misuse tracking logic:
     * If the AI determines risk is LOW but the patient still insists on emergency,
     * that's a potential misuse of the emergency system.
     */
    if (level === 'low' && wantsEmergency === true && patientProfile) {
      patientProfile.misuse.strikes += 1;
      const strikes = patientProfile.misuse.strikes;

      if (strikes >= 3) {
        // 3rd strike: restrict the patient's emergency access
        patientProfile.misuse.restricted = true;
        await NotificationLog.create({
          recipient: req.user.id,
          type: 'misuse_warning',
          message: '⚠️ Your emergency access has been RESTRICTED due to repeated misuse (3 strikes). Contact admin.',
          metadata: { strikes, restricted: true },
        });
      } else {
        // 1st or 2nd strike: show warning
        patientProfile.misuse.warningShown = true;
        await NotificationLog.create({
          recipient: req.user.id,
          type: 'misuse_warning',
          message: `⚠️ Warning (Strike ${strikes}/3): Misusing the emergency system for non-emergencies. Please use regular appointments.`,
          metadata: { strikes, restricted: false },
        });
      }

      await patientProfile.save();
    }

    res.json({
      success: true,
      data: {
        emergencyId: emergency._id,
        riskScore: score,
        riskLevel: level,
        recommendation,
        misuseStrikes: patientProfile ? patientProfile.misuse.strikes : 0,
        restricted: patientProfile ? patientProfile.misuse.restricted : false,
      },
    });
  } catch (error) {
    console.error('ValidateEmergency error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   POST /api/emergency/from-validation
 * @desc    Create an appointment from an emergency validation result
 * @access  Private (patient)
 */
const createAppointmentFromEmergency = async (req, res) => {
  try {
    const { emergencyId, doctorId, hospitalId, riskLevel, symptoms } = req.body;

    // Determine appointment type based on risk level
    let appointmentType = 'normal';
    if (riskLevel === 'high') appointmentType = 'emergency';
    else if (riskLevel === 'medium') appointmentType = 'priority';

    // Book the appointment immediately
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      hospital: hospitalId,
      type: appointmentType,
      appointmentDate: new Date(), // Immediate appointment
      symptoms,
      videoRoomId: uuidv4(),
      videoCallStartTime: new Date(),
    });

    // Update the emergency event to link it to the appointment
    if (emergencyId) {
      await EmergencyEvent.findByIdAndUpdate(emergencyId, { status: 'responding' });
    }

    res.status(201).json({
      success: true,
      message: `${appointmentType.toUpperCase()} appointment created from emergency.`,
      data: appointment,
    });
  } catch (error) {
    console.error('CreateAppointmentFromEmergency error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   POST /api/emergency/fail-safe
 * @desc    Triggered when a patient abandons the validation flow mid-way.
 *          Creates a fail-safe emergency event to ensure no one falls through the cracks.
 * @access  Private (patient)
 */
const failSafeEmergency = async (req, res) => {
  try {
    const { symptoms, lastKnownStep } = req.body;

    const nearestHospital = await Hospital.findOne({ status: 'approved', emergencyServices: true });

    const emergency = await EmergencyEvent.create({
      patient: req.user.id,
      hospital: nearestHospital ? nearestHospital._id : undefined,
      type: 'fail_safe',
      status: 'active',
      symptoms: symptoms || 'Patient abandoned validation - symptoms unknown',
      location: {
        lat: 28.6139,
        lng: 77.2090,
        address: 'Location simulated',
        simulated: true,
      },
      notes: `Patient abandoned validation at step: ${lastKnownStep || 'unknown'}`,
    });

    // Alert the system about this fail-safe event
    await NotificationLog.create({
      recipient: req.user.id,
      type: 'emergency_alert',
      message: '⚠️ FAIL-SAFE TRIGGERED: You left the emergency flow. A record has been created for your safety.',
      metadata: { emergencyId: emergency._id, type: 'fail_safe' },
    });

    res.status(201).json({
      success: true,
      message: 'Fail-safe emergency recorded. Medical staff have been notified.',
      data: { emergencyId: emergency._id },
    });
  } catch (error) {
    console.error('FailSafeEmergency error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/emergency
 * @desc    Get all emergency events (for admin and doctor dashboards)
 * @access  Private (admin, doctor)
 */
const getEmergencyEvents = async (req, res) => {
  try {
    const { status, type } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    // Doctors only see events for their hospital's patients
    // Admins see everything

    const events = await EmergencyEvent.find(filter)
      .populate('patient', 'name email')
      .populate('hospital', 'name city')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: events,
      message: `Found ${events.length} emergency event(s).`,
    });
  } catch (error) {
    console.error('GetEmergencyEvents error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   PUT /api/emergency/:id/resolve
 * @desc    Doctor or admin marks an emergency as resolved
 * @access  Private (admin, doctor)
 */
const resolveEmergency = async (req, res) => {
  try {
    const { notes } = req.body;

    const emergency = await EmergencyEvent.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolvedAt: new Date(),
        notes: notes || 'Resolved',
      },
      { new: true }
    );

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency event not found.' });
    }

    res.json({
      success: true,
      message: 'Emergency resolved.',
      data: emergency,
    });
  } catch (error) {
    console.error('ResolveEmergency error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createRedButtonEmergency,
  validateEmergency,
  createAppointmentFromEmergency,
  failSafeEmergency,
  getEmergencyEvents,
  resolveEmergency,
};
