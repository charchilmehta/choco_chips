import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendOtp, verifyOtp } from '../services/authService';
import Navbar from '../components/common/Navbar';

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist',
  'Orthopedic', 'Pediatrician', 'Psychiatrist', 'Radiologist',
  'Surgeon', 'Dentist', 'ENT Specialist', 'Ophthalmologist',
];

const ID_TYPES = ['Aadhaar', 'PAN Card', 'Passport', 'Voter ID', 'Driving License'];
const RELATIONSHIPS = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', gender: '', dob: '', role: 'patient',
    specialization: '',
    govtIdType: '', govtIdNumber: '', phone: '',
    emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!form.phone) { setError('Please enter your phone number.'); return; }
    setError('');
    setLoading(true);
    try {
      await sendOtp(form.phone);
      setOtpSent(true);
    } catch {
      setError('Failed to send OTP. Please check your phone number.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) { setError('Please enter the OTP.'); return; }
    setError('');
    setLoading(true);
    try {
      await verifyOtp(otp);
      setStep(4);
    } catch {
      setError('Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate(form.role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const TOTAL_STEPS = 4;
  const stepLabels = ['Basic Info', 'Govt ID', 'OTP Verify', 'Emergency Contact'];

  return (
    <div>
      <Navbar />
      <div
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '32px 20px',
          background: 'var(--bg)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>👤</div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text)' }}>Create Account</h2>
            </div>

            {/* Step Indicators */}
            <div className="steps" style={{ marginBottom: '24px' }}>
              {stepLabels.map((label, i) => (
                <React.Fragment key={i}>
                  <div className={`step ${step === i + 1 ? 'active' : step > i + 1 ? 'completed' : ''}`}>
                    <div className="step-number">{step > i + 1 ? '✓' : i + 1}</div>
                    <span style={{ fontSize: '11px', display: window.innerWidth > 500 ? 'block' : 'none' }}>
                      {label}
                    </span>
                  </div>
                  {i < TOTAL_STEPS - 1 && <div className="step-divider" />}
                </React.Fragment>
              ))}
            </div>

            {error && <div className="alert alert-danger">⚠️ {error}</div>}

            {/* Step 1 - Basic Info */}
            {step === 1 && (
              <div className="fade-in">
                <div className="grid-2">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Full Name *</label>
                    <input type="text" name="name" className="form-control" placeholder="John Doe"
                      value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Email Address *</label>
                    <input type="email" name="email" className="form-control" placeholder="you@example.com"
                      value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Password *</label>
                    <input type="password" name="password" className="form-control" placeholder="Min. 8 characters"
                      value={form.password} onChange={handleChange} required minLength={8} />
                  </div>
                  <div className="form-group">
                    <label>Gender *</label>
                    <select name="gender" className="form-control" value={form.gender} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input type="date" name="dob" className="form-control" value={form.dob} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Register as *</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {['patient', 'doctor'].map((r) => (
                        <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', color: 'var(--text)' }}>
                          <input type="radio" name="role" value={r} checked={form.role === r}
                            onChange={handleChange} />
                          {r === 'patient' ? '🧑‍⚕️ Patient' : '👨‍⚕️ Doctor'}
                        </label>
                      ))}
                    </div>
                  </div>
                  {form.role === 'doctor' && (
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Specialization *</label>
                      <select name="specialization" className="form-control" value={form.specialization} onChange={handleChange} required>
                        <option value="">Select Specialization</option>
                        {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-primary w-100"
                  onClick={() => {
                    if (!form.name || !form.email || !form.password || !form.gender || !form.dob) {
                      setError('Please fill all required fields.');
                      return;
                    }
                    if (form.role === 'doctor' && !form.specialization) {
                      setError('Please select your specialization.');
                      return;
                    }
                    setError('');
                    setStep(2);
                  }}
                >
                  Next → Identity Verification
                </button>
              </div>
            )}

            {/* Step 2 - Govt ID */}
            {step === 2 && (
              <div className="fade-in">
                <div className="form-group">
                  <label>Government ID Type *</label>
                  <select name="govtIdType" className="form-control" value={form.govtIdType} onChange={handleChange} required>
                    <option value="">Select ID Type</option>
                    {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>ID Number *</label>
                  <input type="text" name="govtIdNumber" className="form-control" placeholder="Enter your ID number"
                    value={form.govtIdNumber} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" className="form-control" placeholder="+91 9876543210"
                    value={form.phone} onChange={handleChange} required />
                </div>
                {!otpSent ? (
                  <button className="btn btn-primary w-100" onClick={handleSendOtp} disabled={loading}>
                    {loading ? '⏳ Sending OTP...' : '📱 Send OTP'}
                  </button>
                ) : (
                  <div className="alert alert-success">✅ OTP sent to {form.phone}</div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  {otpSent && (
                    <button className="btn btn-primary" onClick={() => setStep(3)}>
                      Next → Verify OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 - OTP Verification */}
            {step === 3 && (
              <div className="fade-in">
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
                  Enter the 6-digit OTP sent to <strong>{form.phone}</strong>
                </p>
                <div className="form-group">
                  <label>OTP Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    style={{ fontSize: '22px', textAlign: 'center', letterSpacing: '6px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary" onClick={handleVerifyOtp} disabled={loading || otp.length < 4}>
                    {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
                  </button>
                </div>
                <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Didn't receive it?{' '}
                  <button onClick={handleSendOtp} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                    Resend OTP
                  </button>
                </p>
              </div>
            )}

            {/* Step 4 - Emergency Contact */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="fade-in">
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
                  Provide an emergency contact who will be notified in case of emergencies.
                </p>
                <div className="form-group">
                  <label>Contact Name *</label>
                  <input type="text" name="emergencyContactName" className="form-control" placeholder="Full name"
                    value={form.emergencyContactName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Relationship *</label>
                  <select name="emergencyContactRelation" className="form-control" value={form.emergencyContactRelation} onChange={handleChange} required>
                    <option value="">Select Relationship</option>
                    {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Contact Phone *</label>
                  <input type="tel" name="emergencyContactPhone" className="form-control" placeholder="+91 9876543210"
                    value={form.emergencyContactPhone} onChange={handleChange} required />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setStep(3)}>← Back</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? '⏳ Creating Account...' : '🎉 Create Account'}
                  </button>
                </div>
              </form>
            )}

            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '20px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
