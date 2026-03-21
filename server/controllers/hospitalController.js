/**
 * Hospital Controller
 * Handles hospital registration, listing, search, and retrieval.
 */

const Hospital = require('../models/Hospital');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

/**
 * @route   POST /api/hospitals
 * @desc    Register a new hospital (starts as pending, awaits admin approval)
 * @access  Private
 */
const registerHospital = async (req, res) => {
  try {
    const {
      name, type, address, city, state, pincode,
      phone, email, registrationNumber, departments,
      emergencyServices, location,
    } = req.body;

    const hospital = await Hospital.create({
      name, type, address, city, state, pincode,
      phone, email, registrationNumber, departments,
      emergencyServices,
      location: location || { lat: 0, lng: 0 }, // Simulated coordinates
      createdBy: req.user.id,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Hospital registered. Awaiting admin approval.',
      data: hospital,
    });
  } catch (error) {
    console.error('RegisterHospital error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/hospitals
 * @desc    Get all approved hospitals. Supports filtering by city, type, and search.
 * @access  Public
 */
const getHospitals = async (req, res) => {
  try {
    const { city, type, search } = req.query;

    // Build query filter dynamically
    const filter = { status: 'approved' };

    if (city) filter.city = new RegExp(city, 'i');       // Case-insensitive city match
    if (type) filter.type = type;                         // 'private' or 'government'
    if (search) {
      // Search across name, city, and state fields
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { state: new RegExp(search, 'i') },
      ];
    }

    const hospitals = await Hospital.find(filter).populate('createdBy', 'name email');

    res.json({
      success: true,
      data: hospitals,
      message: `Found ${hospitals.length} hospital(s).`,
    });
  } catch (error) {
    console.error('GetHospitals error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/hospitals/:id
 * @desc    Get a single hospital with its list of doctors
 * @access  Public
 */
const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    // Get all doctors working at this hospital
    const doctorProfiles = await DoctorProfile.find({ hospital: hospital._id })
      .populate('user', 'name email');

    res.json({
      success: true,
      data: { hospital, doctors: doctorProfiles },
    });
  } catch (error) {
    console.error('GetHospitalById error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/hospitals/search
 * @desc    Search hospitals by location (simulated using city/state matching)
 * @access  Public
 * // EXTRA FEATURE
 */
const searchHospitals = async (req, res) => {
  try {
    const { city, state, type, emergencyOnly } = req.query;

    const filter = { status: 'approved' };

    if (city) filter.city = new RegExp(city, 'i');
    if (state) filter.state = new RegExp(state, 'i');
    if (type) filter.type = type;
    if (emergencyOnly === 'true') filter.emergencyServices = true;

    const hospitals = await Hospital.find(filter);

    // Simulate distance calculation (in a real app, use geospatial queries)
    const hospitalsWithDistance = hospitals.map((h) => ({
      ...h.toObject(),
      simulatedDistance: `${(Math.random() * 10 + 0.5).toFixed(1)} km`, // Fake distance
    }));

    res.json({
      success: true,
      message: `Found ${hospitals.length} hospital(s) near you (simulated).`,
      data: hospitalsWithDistance,
    });
  } catch (error) {
    console.error('SearchHospitals error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/hospitals/my/hospital
 * @desc    Get the hospital associated with the logged-in doctor
 * @access  Private (doctor)
 */
const getMyHospital = async (req, res) => {
  try {
    const doctorProfile = await DoctorProfile.findOne({ user: req.user.id })
      .populate('hospital');

    if (!doctorProfile || !doctorProfile.hospital) {
      return res.status(404).json({ success: false, message: 'No hospital assigned to your profile.' });
    }

    res.json({
      success: true,
      data: doctorProfile.hospital,
    });
  } catch (error) {
    console.error('GetMyHospital error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  registerHospital,
  getHospitals,
  getHospitalById,
  searchHospitals,
  getMyHospital,
};
