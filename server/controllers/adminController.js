/**
 * Admin Controller
 * Handles admin-level operations: hospital approvals, user management,
 * misuse reports, and dashboard statistics.
 */

const Hospital = require('../models/Hospital');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const EmergencyEvent = require('../models/EmergencyEvent');
const Appointment = require('../models/Appointment');

/**
 * @route   GET /api/admin/hospitals/pending
 * @desc    Get all hospitals awaiting admin approval
 * @access  Private (admin)
 */
const getPendingHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: 'pending' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      success: true,
      data: hospitals,
      message: `${hospitals.length} pending hospital application(s).`,
    });
  } catch (error) {
    console.error('GetPendingHospitals error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   PUT /api/admin/hospitals/:id/approve
 * @desc    Admin approves a hospital registration
 * @access  Private (admin)
 */
const approveHospital = async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        adminNotes: adminNotes || 'Approved by admin.',
      },
      { new: true } // Return the updated document
    );

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    res.json({
      success: true,
      message: `Hospital "${hospital.name}" has been approved.`,
      data: hospital,
    });
  } catch (error) {
    console.error('ApproveHospital error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   PUT /api/admin/hospitals/:id/reject
 * @desc    Admin rejects a hospital registration
 * @access  Private (admin)
 */
const rejectHospital = async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        adminNotes: adminNotes || 'Rejected by admin.',
      },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    res.json({
      success: true,
      message: `Hospital "${hospital.name}" has been rejected.`,
      data: hospital,
    });
  } catch (error) {
    console.error('RejectHospital error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all registered users in the system
 * @access  Private (admin)
 */
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = {};
    if (role) filter.role = role; // Optional filter by role

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      message: `Found ${users.length} user(s).`,
    });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/admin/misuse-reports
 * @desc    Get patients who have emergency misuse strikes
 * @access  Private (admin)
 * // EXTRA FEATURE
 */
const getMisuseReports = async (req, res) => {
  try {
    // Find patients with at least 1 misuse strike
    const misuseProfiles = await PatientProfile.find({
      'misuse.strikes': { $gt: 0 },
    }).populate('user', 'name email');

    res.json({
      success: true,
      data: misuseProfiles,
      message: `Found ${misuseProfiles.length} patient(s) with misuse strikes.`,
    });
  } catch (error) {
    console.error('GetMisuseReports error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get high-level system statistics for admin dashboard
 * @access  Private (admin)
 */
const getDashboardStats = async (req, res) => {
  try {
    // Run all count queries in parallel for efficiency
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalHospitals,
      approvedHospitals,
      pendingHospitals,
      totalEmergencies,
      activeEmergencies,
      totalAppointments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Hospital.countDocuments(),
      Hospital.countDocuments({ status: 'approved' }),
      Hospital.countDocuments({ status: 'pending' }),
      EmergencyEvent.countDocuments(),
      EmergencyEvent.countDocuments({ status: 'active' }),
      Appointment.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, patients: totalPatients, doctors: totalDoctors },
        hospitals: { total: totalHospitals, approved: approvedHospitals, pending: pendingHospitals },
        emergencies: { total: totalEmergencies, active: activeEmergencies },
        appointments: { total: totalAppointments },
      },
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getPendingHospitals,
  approveHospital,
  rejectHospital,
  getAllUsers,
  getMisuseReports,
  getDashboardStats,
};
