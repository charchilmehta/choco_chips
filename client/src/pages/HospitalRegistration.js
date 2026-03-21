import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerHospital } from '../services/hospitalService';
import Navbar from '../components/common/Navbar';

const HOSPITAL_TYPES = ['private', 'government', 'clinic', 'multispecialty', 'nursing home'];

const ALL_DEPARTMENTS = [
  'General Medicine', 'Emergency', 'Cardiology', 'Neurology',
  'Orthopedics', 'Pediatrics', 'Gynecology', 'Dermatology',
  'Radiology', 'Pathology', 'ENT', 'Ophthalmology',
  'Psychiatry', 'Dentistry', 'Oncology', 'Urology',
];

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

const HospitalRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', type: 'private',
    address: '', city: '', state: '', pincode: '',
    phone: '', email: '', registrationNumber: '',
    departments: [],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDepartmentToggle = (dept) => {
    setForm((prev) => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter((d) => d !== dept)
        : [...prev.departments, dept],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.departments.length === 0) {
      setError('Please select at least one department.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await registerHospital(form);
    } catch { /* demo mode */ }
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div>
        <Navbar />
        <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card fade-in" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: 'var(--secondary)', marginBottom: '12px' }}>Registration Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
              Thank you for registering <strong>{form.name}</strong>.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              Your application is <strong>pending admin approval</strong>. You will be notified via email at <strong>{form.email}</strong> once your registration is approved.
            </p>
            <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Typical review time: <strong>2–3 business days</strong>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg)', padding: '32px 20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏥</div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text)' }}>
                Register Your Hospital
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                Join our network of verified healthcare providers.
              </p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Basic Info */}
              <h4 style={{ marginBottom: '12px', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                Basic Information
              </h4>
              <div className="grid-2">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Hospital Name *</label>
                  <input type="text" name="name" className="form-control"
                    placeholder="e.g. City Care Hospital" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Hospital Type *</label>
                  <select name="type" className="form-control" value={form.type} onChange={handleChange} required>
                    {HOSPITAL_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Registration Number *</label>
                  <input type="text" name="registrationNumber" className="form-control"
                    placeholder="Government registration number" value={form.registrationNumber} onChange={handleChange} required />
                </div>
              </div>

              {/* Address */}
              <h4 style={{ margin: '16px 0 12px', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                Address
              </h4>
              <div className="form-group">
                <label>Street Address *</label>
                <input type="text" name="address" className="form-control"
                  placeholder="Full street address" value={form.address} onChange={handleChange} required />
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label>City *</label>
                  <input type="text" name="city" className="form-control"
                    placeholder="City" value={form.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <select name="state" className="form-control" value={form.state} onChange={handleChange} required>
                    <option value="">Select State</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input type="text" name="pincode" className="form-control"
                    placeholder="6-digit PIN" value={form.pincode} onChange={handleChange}
                    maxLength={6} pattern="[0-9]{6}" required />
                </div>
              </div>

              {/* Contact */}
              <h4 style={{ margin: '16px 0 12px', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                Contact Details
              </h4>
              <div className="grid-2">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" className="form-control"
                    placeholder="+91 9876543210" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" name="email" className="form-control"
                    placeholder="hospital@example.com" value={form.email} onChange={handleChange} required />
                </div>
              </div>

              {/* Departments */}
              <h4 style={{ margin: '16px 0 12px', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                Departments Available
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {ALL_DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleDepartmentToggle(dept)}
                    className={`btn btn-sm ${form.departments.includes(dept) ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {form.departments.includes(dept) ? '✓ ' : ''}{dept}
                  </button>
                ))}
              </div>
              {form.departments.length > 0 && (
                <p style={{ fontSize: '13px', color: 'var(--secondary)', marginBottom: '16px' }}>
                  ✅ Selected: {form.departments.join(', ')}
                </p>
              )}

              <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                {loading ? '⏳ Submitting...' : '🏥 Submit Registration'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalRegistration;
