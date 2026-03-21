/**
 * Database Seed Script
 * Creates initial data for development and testing:
 * - Admin user
 * - Sample hospital (approved)
 * - Doctor user + profile
 * - Patient user + profile
 *
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const { generatePatientId } = require('../utils/patientIdGenerator');

/**
 * Main seed function.
 * Clears existing data and creates fresh seed records.
 */
const seedDatabase = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...\n');

    // ─────────────────────────────────────────────────────────────
    // Clear existing data (to avoid duplicate key errors)
    // ─────────────────────────────────────────────────────────────
    console.log('🧹 Clearing existing seed data...');
    await User.deleteMany({ email: { $in: ['admin@healthcare.com', 'doctor@healthcare.com', 'patient@healthcare.com'] } });
    await Hospital.deleteMany({ name: 'City General Hospital' });
    console.log('✅ Old data cleared.\n');

    // ─────────────────────────────────────────────────────────────
    // 1. Create Admin User
    // ─────────────────────────────────────────────────────────────
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@healthcare.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // ─────────────────────────────────────────────────────────────
    // 2. Create Hospital (approved by admin)
    // ─────────────────────────────────────────────────────────────
    console.log('\n🏥 Creating hospital...');
    const hospital = await Hospital.create({
      name: 'City General Hospital',
      type: 'government',
      address: '123 Healthcare Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91-22-12345678',
      email: 'info@citygeneralhospital.com',
      registrationNumber: 'MH-HOSP-2024-001',
      departments: ['General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Emergency'],
      emergencyServices: true,
      location: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
      status: 'approved',
      approvedBy: admin._id,
      approvedAt: new Date(),
      adminNotes: 'Approved during initial system setup.',
      createdBy: admin._id,
    });
    console.log(`✅ Hospital created: ${hospital.name} (${hospital.status})`);

    // ─────────────────────────────────────────────────────────────
    // 3. Create Doctor User + Profile
    // ─────────────────────────────────────────────────────────────
    console.log('\n👨‍⚕️ Creating doctor...');
    const doctor = await User.create({
      name: 'Dr. Rajesh Kumar',
      email: 'doctor@healthcare.com',
      password: 'Doctor@123',
      role: 'doctor',
    });

    await DoctorProfile.create({
      user: doctor._id,
      hospital: hospital._id,
      specialization: 'General Medicine',
      department: 'General Medicine',
      licenseNumber: 'MCI-2024-DR-456789',
      experience: 12,
      availabilityStatus: 'available',
      consultationFee: 500,
      bio: 'Experienced general practitioner with 12 years of practice. Specializes in preventive care and chronic disease management.',
      // Default weekly schedule: Monday to Saturday, 9 AM - 5 PM, 30-min slots
      schedule: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
        { day: 'Saturday', startTime: '09:00', endTime: '13:00', slotDuration: 30 },
      ],
    });
    console.log(`✅ Doctor created: ${doctor.email}`);

    // ─────────────────────────────────────────────────────────────
    // 4. Create Patient User + Profile
    // ─────────────────────────────────────────────────────────────
    console.log('\n🧑‍🤝‍🧑 Creating patient...');
    const patient = await User.create({
      name: 'Priya Sharma',
      email: 'patient@healthcare.com',
      password: 'Patient@123',
      role: 'patient',
    });

    const patientId = generatePatientId();
    await PatientProfile.create({
      user: patient._id,
      patientId,
      gender: 'female',
      bloodGroup: 'B+',
      city: 'Mumbai',
      state: 'Maharashtra',
      allergies: ['Penicillin'],
      chronicConditions: [],
      emergencyContacts: [
        {
          name: 'Rahul Sharma',
          relationship: 'Brother',
          phone: '+91-9876543210',
          isNotified: false,
        },
      ],
    });
    console.log(`✅ Patient created: ${patient.email} (Patient ID: ${patientId})`);

    // ─────────────────────────────────────────────────────────────
    // Print Summary
    // ─────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log('🌱 SEED COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('\n👤 ADMIN:');
    console.log('   Email:    admin@healthcare.com');
    console.log('   Password: Admin@123');
    console.log('\n👨‍⚕️ DOCTOR:');
    console.log('   Email:    doctor@healthcare.com');
    console.log('   Password: Doctor@123');
    console.log('\n🧑‍🤝‍🧑 PATIENT:');
    console.log('   Email:    patient@healthcare.com');
    console.log('   Password: Patient@123');
    console.log(`   Patient ID: ${patientId}`);
    console.log('\n🏥 HOSPITAL:');
    console.log(`   Name: ${hospital.name}`);
    console.log(`   ID:   ${hospital._id}`);
    console.log('\n' + '═'.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
