/**
 * Medical Controller
 * Handles creation and retrieval of medical records,
 * including prescriptions and report downloads.
 */

const MedicalRecord = require('../models/MedicalRecord');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');

/**
 * @route   POST /api/medical
 * @desc    Doctor creates a medical record for a patient after a visit
 * @access  Private (doctor)
 */
const createRecord = async (req, res) => {
  try {
    const {
      patientId, appointmentId, hospitalId,
      visitNotes, diagnosis, prescriptions,
      reports, followUpDate,
    } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required.' });
    }

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: req.user.id,
      appointment: appointmentId,
      hospital: hospitalId,
      visitNotes,
      diagnosis,
      prescriptions: prescriptions || [],
      reports: reports || [],
      followUpDate,
    });

    const populated = await record.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Medical record created.',
      data: populated,
    });
  } catch (error) {
    console.error('CreateRecord error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/medical/patient/:patientId
 * @desc    Get all medical records for a specific patient
 *          Patients can only see their own records; doctors see their patients' records
 * @access  Private
 */
const getPatientRecords = async (req, res) => {
  try {
    const filter = { patient: req.params.patientId };

    // Doctors can only see records they created
    if (req.user.role === 'doctor') {
      filter.doctor = req.user.id;
    }

    // Patients can only see their own records
    if (req.user.role === 'patient' && req.params.patientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const records = await MedicalRecord.find(filter)
      .populate('doctor', 'name email')
      .populate('hospital', 'name')
      .sort({ visitDate: -1 });

    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error('GetPatientRecords error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/medical/:id
 * @desc    Get a single medical record by its ID
 * @access  Private
 */
const getRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .populate('hospital', 'name address city');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    // Security: Patients can only access their own records
    if (req.user.role === 'patient' && record.patient._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('GetRecordById error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   POST /api/medical/:id/prescription
 * @desc    Doctor adds a new prescription to an existing medical record
 * @access  Private (doctor)
 */
const addPrescription = async (req, res) => {
  try {
    const { medicineName, dosage, frequency, duration, instructions } = req.body;

    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    // Only the doctor who created the record can add prescriptions
    if (record.doctor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    record.prescriptions.push({ medicineName, dosage, frequency, duration, instructions });
    await record.save();

    res.json({
      success: true,
      message: 'Prescription added.',
      data: record.prescriptions,
    });
  } catch (error) {
    console.error('AddPrescription error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/medical/:id/prescription/download
 * @desc    Simulate a prescription PDF download. Returns formatted prescription data as JSON.
 * @access  Private
 * // EXTRA FEATURE
 */
const downloadPrescription = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .populate('hospital', 'name address city phone');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    // Security: Only the patient or the doctor can download
    const isPatient = req.user.role === 'patient' && record.patient._id.toString() === req.user.id;
    const isDoctor = req.user.role === 'doctor' && record.doctor._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Format the prescription as a readable JSON (simulating a PDF content structure)
    const prescriptionData = {
      header: {
        hospitalName: record.hospital ? record.hospital.name : 'Healthcare System',
        hospitalAddress: record.hospital ? `${record.hospital.address}, ${record.hospital.city}` : '',
        hospitalPhone: record.hospital ? record.hospital.phone : '',
        date: new Date().toLocaleDateString('en-IN'),
      },
      patient: {
        name: record.patient.name,
        email: record.patient.email,
      },
      doctor: {
        name: record.doctor.name,
        email: record.doctor.email,
      },
      visit: {
        date: record.visitDate,
        diagnosis: record.diagnosis,
        visitNotes: record.visitNotes,
      },
      prescriptions: record.prescriptions,
      followUpDate: record.followUpDate,
      footer: 'This is a digitally generated prescription (simulated). Valid only with doctor signature.',
    };

    res.json({
      success: true,
      message: 'Prescription data (simulated PDF content)',
      data: prescriptionData,
    });
  } catch (error) {
    console.error('DownloadPrescription error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createRecord,
  getPatientRecords,
  getRecordById,
  addPrescription,
  downloadPrescription,
};
