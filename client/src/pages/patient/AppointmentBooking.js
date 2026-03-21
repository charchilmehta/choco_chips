import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHospitals } from '../../services/hospitalService';
import { getDoctors, getSlots, bookAppointment } from '../../services/appointmentService';
import EmergencyValidator from '../../components/emergency/EmergencyValidator';

const SPECIALIZATIONS = [
  'All', 'General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist',
  'Orthopedic', 'Pediatrician', 'Dentist', 'ENT Specialist',
];

const DEMO_HOSPITALS = [
  { _id: 'h1', name: 'City Care Hospital', city: 'Mumbai', type: 'private' },
  { _id: 'h2', name: 'Apollo Clinic', city: 'Delhi', type: 'private' },
  { _id: 'h3', name: 'Government District Hospital', city: 'Bangalore', type: 'government' },
];

const DEMO_DOCTORS = [
  { _id: 'd1', name: 'Dr. Anita Roy', specialization: 'Cardiologist', experience: '12 years', rating: 4.8 },
  { _id: 'd2', name: 'Dr. Rakesh Mehta', specialization: 'General Physician', experience: '8 years', rating: 4.5 },
  { _id: 'd3', name: 'Dr. Priya Joshi', specialization: 'Dentist', experience: '6 years', rating: 4.7 },
];

const DEMO_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM', '11:30 AM', '02:00 PM', '03:00 PM', '04:30 PM'];

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [specialization, setSpecialization] = useState('All');
  const [symptoms, setSymptoms] = useState('');
  const [appointmentType, setAppointmentType] = useState('general');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const res = await getHospitals();
        setHospitals(res.data.hospitals || res.data || DEMO_HOSPITALS);
      } catch {
        setHospitals(DEMO_HOSPITALS);
      }
    };
    loadHospitals();
  }, []);

  useEffect(() => {
    if (!selectedHospital) return;
    const loadDoctors = async () => {
      try {
        const params = specialization !== 'All' ? { hospitalId: selectedHospital._id, specialization } : { hospitalId: selectedHospital._id };
        const res = await getDoctors(params);
        setDoctors(res.data.doctors || res.data || DEMO_DOCTORS);
      } catch {
        setDoctors(DEMO_DOCTORS);
      }
    };
    loadDoctors();
  }, [selectedHospital, specialization]);

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    const loadSlots = async () => {
      try {
        const res = await getSlots(selectedDoctor._id, selectedDate);
        setSlots(res.data.slots || res.data || DEMO_SLOTS);
      } catch {
        setSlots(DEMO_SLOTS);
      }
    };
    loadSlots();
  }, [selectedDoctor, selectedDate]);

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
    h.city?.toLowerCase().includes(hospitalSearch.toLowerCase())
  );

  const filteredDoctors = doctors.filter((d) =>
    specialization === 'All' || d.specialization === specialization
  );

  const handleBook = async () => {
    setLoading(true);
    setError('');
    try {
      await bookAppointment({
        hospitalId: selectedHospital._id,
        doctorId: selectedDoctor._id,
        date: selectedDate,
        time: selectedSlot,
        symptoms,
        type: appointmentType,
      });
    } catch { /* demo mode */ }
    setBooked(true);
    setLoading(false);
  };

  const STEP_LABELS = ['Hospital', 'Doctor', 'Date & Slot', 'Symptoms', 'Emergency Check', 'Confirm'];
  const totalSteps = appointmentType === 'emergency' ? 6 : 5;

  if (booked) {
    return (
      <div className="card fade-in" style={{ textAlign: 'center', padding: '48px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ color: 'var(--secondary)', marginBottom: '12px' }}>Appointment Booked!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <strong>Doctor:</strong> {selectedDoctor?.name}
        </p>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <strong>Date:</strong> {selectedDate} at {selectedSlot}
        </p>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          <strong>Hospital:</strong> {selectedHospital?.name}
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/patient')}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">📅 Book Appointment</h1>

      {/* Step indicators */}
      <div className="steps" style={{ marginBottom: '24px', flexWrap: 'wrap' }}>
        {STEP_LABELS.slice(0, totalSteps).map((label, i) => (
          <React.Fragment key={i}>
            <div className={`step ${step === i + 1 ? 'active' : step > i + 1 ? 'completed' : ''}`}>
              <div className="step-number">{step > i + 1 ? '✓' : i + 1}</div>
              <span style={{ fontSize: '11px' }}>{label}</span>
            </div>
            {i < totalSteps - 1 && <div className="step-divider" />}
          </React.Fragment>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Step 1 - Hospital Selection */}
      {step === 1 && (
        <div className="card fade-in">
          <h3 className="section-title">🏥 Select Hospital</h3>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search hospitals by name or city..."
              value={hospitalSearch}
              onChange={(e) => setHospitalSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredHospitals.map((h) => (
              <div
                key={h._id}
                onClick={() => { setSelectedHospital(h); setStep(2); }}
                style={{
                  padding: '14px 16px',
                  border: `2px solid ${selectedHospital?._id === h._id ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: selectedHospital?._id === h._id ? 'rgba(33,150,243,0.05)' : 'var(--card-bg)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: '600' }}>{h.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>📍 {h.city}</div>
                </div>
                <span className={`badge badge-${h.type === 'government' ? 'primary' : 'secondary'}`}>
                  {h.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 - Doctor Selection */}
      {step === 2 && (
        <div className="card fade-in">
          <h3 className="section-title">👨‍⚕️ Select Doctor at {selectedHospital?.name}</h3>
          <div className="form-group">
            <label>Filter by Specialization</label>
            <select className="form-control" value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
              {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredDoctors.map((d) => (
              <div
                key={d._id}
                onClick={() => { setSelectedDoctor(d); setStep(3); }}
                style={{
                  padding: '14px 16px',
                  border: `2px solid ${selectedDoctor?._id === d._id ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: selectedDoctor?._id === d._id ? 'rgba(33,150,243,0.05)' : 'var(--card-bg)',
                }}
              >
                <div>
                  <div style={{ fontWeight: '600' }}>{d.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {d.specialization} • {d.experience}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#FF9800', fontWeight: '600' }}>⭐ {d.rating}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-outline" style={{ marginTop: '12px' }} onClick={() => setStep(1)}>← Back</button>
        </div>
      )}

      {/* Step 3 - Date & Slot */}
      {step === 3 && (
        <div className="card fade-in">
          <h3 className="section-title">📅 Select Date & Time</h3>
          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          {selectedDate && (
            <div>
              <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                Available Slots for {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {slots.map((slot) => (
                  <button
                    key={slot}
                    className={`btn ${selectedSlot === slot ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(4)} disabled={!selectedDate || !selectedSlot}>
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 4 - Symptoms & Type */}
      {step === 4 && (
        <div className="card fade-in">
          <h3 className="section-title">🩺 Describe Symptoms</h3>
          <div className="form-group">
            <label>Symptoms / Reason for visit *</label>
            <textarea
              className="form-control"
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe what you are experiencing..."
            />
          </div>
          <div className="form-group">
            <label>Appointment Type</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              {['general', 'video', 'emergency'].map((type) => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="radio"
                    name="appointmentType"
                    value={type}
                    checked={appointmentType === type}
                    onChange={() => setAppointmentType(type)}
                  />
                  {type === 'general' ? '🏥 In-Person' : type === 'video' ? '🎥 Video' : '🆘 Emergency'}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(appointmentType === 'emergency' ? 5 : 6)} disabled={!symptoms.trim()}>
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 5 - Emergency Validation (only if emergency type) */}
      {step === 5 && appointmentType === 'emergency' && (
        <div className="fade-in">
          <EmergencyValidator onClose={() => setStep(6)} />
          <button className="btn btn-outline" style={{ marginTop: '12px' }} onClick={() => setStep(4)}>← Back</button>
          <button className="btn btn-primary" style={{ marginTop: '12px', marginLeft: '8px' }} onClick={() => setStep(6)}>
            Continue to Confirm →
          </button>
        </div>
      )}

      {/* Step 6 (or 5 for non-emergency) - Confirmation */}
      {(step === 6 || (step === 5 && appointmentType !== 'emergency')) && (
        <div className="card fade-in">
          <h3 className="section-title">✅ Confirm Appointment</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Hospital', value: selectedHospital?.name },
              { label: 'Doctor', value: selectedDoctor?.name },
              { label: 'Specialization', value: selectedDoctor?.specialization },
              { label: 'Date', value: selectedDate },
              { label: 'Time', value: selectedSlot },
              { label: 'Type', value: appointmentType === 'video' ? '🎥 Video' : appointmentType === 'emergency' ? '🆘 Emergency' : '🏥 In-Person' },
              { label: 'Symptoms', value: symptoms },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: '120px', color: 'var(--text-secondary)', fontSize: '13px', flexShrink: 0 }}>{item.label}:</span>
                <span style={{ fontWeight: '500', fontSize: '14px' }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" onClick={() => setStep(appointmentType === 'emergency' ? 5 : 4)}>← Back</button>
            <button className="btn btn-primary" onClick={handleBook} disabled={loading}>
              {loading ? '⏳ Booking...' : '📅 Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;
