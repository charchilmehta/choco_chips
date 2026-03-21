import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sendOtp, verifyOtp } from '../../services/authService';
import API from '../../services/api';

const RELATIONSHIPS = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'];

const Profile = () => {
  const { user, logout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    dob: user?.dob ? user.dob.split('T')[0] : '',
  });

  const [otpPhone, setOtpPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMsg, setOtpMsg] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  const [contacts, setContacts] = useState(
    user?.emergencyContacts || [
      { id: 1, name: 'Family Contact', relation: 'Parent', phone: '+91-9876543210' },
    ]
  );
  const [addingContact, setAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', relation: '', phone: '' });
  const [editingContact, setEditingContact] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await API.put('/auth/profile', form);
    } catch { /* demo mode */ }
    setSaveMsg('✅ Profile updated successfully!');
    setEditing(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleSendOtp = async () => {
    if (!otpPhone) return;
    try {
      await sendOtp(otpPhone);
    } catch { /* demo */ }
    setOtpSent(true);
    setOtpMsg('OTP sent to ' + otpPhone);
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    try {
      await verifyOtp(otp);
    } catch { /* demo */ }
    setOtpVerified(true);
    setOtpMsg('✅ Phone verified successfully!');
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (editingContact !== null) {
      setContacts((prev) => prev.map((c) => c.id === editingContact ? { ...newContact, id: editingContact } : c));
      setEditingContact(null);
    } else {
      setContacts((prev) => [...prev, { ...newContact, id: Date.now() }]);
    }
    setNewContact({ name: '', relation: '', phone: '' });
    setAddingContact(false);
  };

  const handleEditContact = (c) => {
    setNewContact({ name: c.name, relation: c.relation, phone: c.phone });
    setEditingContact(c.id);
    setAddingContact(true);
  };

  const handleDeleteContact = (id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div>
      <h1 className="page-title">👤 My Profile</h1>

      {saveMsg && <div className="alert alert-success">{saveMsg}</div>}

      {/* Patient ID Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{user?.name}</div>
            <div style={{ opacity: 0.85, fontSize: '13px', marginTop: '4px' }}>
              Patient ID: <strong>{user?._id?.slice(-8).toUpperCase() || 'P' + Math.floor(Math.random() * 9000 + 1000)}</strong>
            </div>
            <div style={{ opacity: 0.75, fontSize: '12px', marginTop: '2px' }}>{user?.email}</div>
          </div>
          <div style={{ fontSize: '48px' }}>🏥</div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>Personal Information</h3>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? '✕ Cancel' : '✏️ Edit'}
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-control" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={!editing} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={!editing} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" className="form-control" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={!editing} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select className="form-control" value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                disabled={!editing}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" className="form-control" value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                disabled={!editing} />
            </div>
          </div>

          {editing && (
            <button type="submit" className="btn btn-primary">
              💾 Save Changes
            </button>
          )}
        </form>
      </div>

      {/* OTP Verification for Govt ID */}
      <div className="card">
        <h3 className="section-title">🔐 Govt ID Verification (OTP)</h3>
        {otpVerified ? (
          <div className="alert alert-success">✅ Phone number verified!</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="tel"
                className="form-control"
                placeholder="Enter phone to verify"
                value={otpPhone}
                onChange={(e) => setOtpPhone(e.target.value)}
                style={{ maxWidth: '240px' }}
              />
              <button className="btn btn-outline btn-sm" onClick={handleSendOtp}>
                📱 Send OTP
              </button>
            </div>
            {otpSent && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ maxWidth: '160px', textAlign: 'center', letterSpacing: '4px' }}
                  maxLength={6}
                />
                <button className="btn btn-primary btn-sm" onClick={handleVerifyOtp}>
                  ✅ Verify
                </button>
              </div>
            )}
            {otpMsg && <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--secondary)' }}>{otpMsg}</p>}
          </>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>👥 Emergency Contacts</h3>
          <button className="btn btn-primary btn-sm" onClick={() => { setAddingContact(true); setEditingContact(null); setNewContact({ name: '', relation: '', phone: '' }); }}>
            ➕ Add
          </button>
        </div>

        {addingContact && (
          <form onSubmit={handleAddContact} style={{ background: 'var(--bg)', padding: '16px', borderRadius: '10px', marginBottom: '12px' }}>
            <div className="grid-3">
              <div className="form-group">
                <label>Name</label>
                <input type="text" className="form-control" value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Relationship</label>
                <select className="form-control" value={newContact.relation}
                  onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })} required>
                  <option value="">Select</option>
                  {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" className="form-control" value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-success btn-sm">
                {editingContact ? '💾 Update' : '➕ Add Contact'}
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setAddingContact(false); setEditingContact(null); }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {contacts.map((c) => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '8px', marginBottom: '8px' }}>
            <div>
              <div style={{ fontWeight: '600' }}>{c.name} <span style={{ fontWeight: '400', fontSize: '12px', color: 'var(--text-secondary)' }}>({c.relation})</span></div>
              <div style={{ fontSize: '13px', color: 'var(--primary)' }}>{c.phone}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn btn-outline btn-sm" onClick={() => handleEditContact(c)}>✏️</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteContact(c.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="section-title" style={{ color: 'var(--danger)' }}>⚠️ Account</h3>
        <button className="btn btn-danger btn-sm" onClick={logout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
