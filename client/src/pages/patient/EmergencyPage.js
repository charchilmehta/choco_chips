import React, { useState } from 'react';
import RedButton from '../../components/emergency/RedButton';
import EmergencyValidator from '../../components/emergency/EmergencyValidator';

const HELPLINES = [
  { number: '108', label: 'Ambulance', emoji: '🚑' },
  { number: '102', label: 'Emergency', emoji: '🆘' },
  { number: '100', label: 'Police', emoji: '👮' },
  { number: '1091', label: 'Women Helpline', emoji: '👩' },
  { number: '1800-180-1104', label: 'Health Helpline', emoji: '🏥' },
];

const EmergencyPage = () => {
  const [showValidator, setShowValidator] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: 'Mom', relation: 'Parent', phone: '+91-9876543210' },
  ]);
  const [newContact, setNewContact] = useState({ name: '', relation: '', phone: '' });
  const [addingContact, setAddingContact] = useState(false);
  const [autoCallMsg, setAutoCallMsg] = useState('');

  const simulateCall = () => {
    setAutoCallMsg('📞 Connecting to 108... Please stay calm. Help is on the way!');
    setTimeout(() => setAutoCallMsg(''), 5000);
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    setEmergencyContacts((prev) => [...prev, { ...newContact, id: Date.now() }]);
    setNewContact({ name: '', relation: '', phone: '' });
    setAddingContact(false);
  };

  const handleDeleteContact = (id) => {
    setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div>
      <h1 className="page-title">🆘 Emergency Hub</h1>

      {/* Red Button */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #fff8f8, #fff)', border: '2px solid #ffcdd2', textAlign: 'center', padding: '36px' }}>
        <h2 style={{ color: '#c62828', marginBottom: '8px', fontWeight: '700' }}>Immediate Emergency</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
          Press the button below to instantly alert emergency contacts and services.
        </p>
        <RedButton />
        <button
          className="btn btn-outline"
          onClick={simulateCall}
          style={{ marginTop: '20px', borderColor: '#c62828', color: '#c62828' }}
        >
          📞 Simulate Auto-Call to 108
        </button>
        {autoCallMsg && (
          <div className="alert alert-danger" style={{ marginTop: '12px' }}>
            {autoCallMsg}
          </div>
        )}
      </div>

      {/* AI Validator option */}
      <div className="card">
        <h3 className="section-title">🤖 Not Sure If It's an Emergency?</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
          Use our AI assessment to evaluate the urgency of your situation.
        </p>
        <button
          className="btn btn-warning"
          onClick={() => setShowValidator((v) => !v)}
        >
          {showValidator ? '✕ Close Assessment' : '🔍 Start AI Assessment'}
        </button>
      </div>

      {showValidator && <EmergencyValidator onClose={() => setShowValidator(false)} />}

      {/* Helpline Numbers */}
      <div className="card">
        <h3 className="section-title">📞 Emergency Helplines</h3>
        <div className="grid-3">
          {HELPLINES.map((h) => (
            <a
              key={h.number}
              href={`tel:${h.number}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px',
                background: 'var(--bg)',
                borderRadius: '10px',
                textDecoration: 'none',
                border: '1px solid var(--border)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{h.emoji}</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--danger)' }}>{h.number}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{h.label}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>👥 Emergency Contacts</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setAddingContact(true)}>
            ➕ Add Contact
          </button>
        </div>

        {addingContact && (
          <form onSubmit={handleAddContact} style={{ background: 'var(--bg)', padding: '16px', borderRadius: '10px', marginBottom: '12px' }} className="fade-in">
            <div className="grid-3">
              <div className="form-group">
                <label>Name</label>
                <input type="text" className="form-control" value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Relationship</label>
                <input type="text" className="form-control" value={newContact.relation}
                  onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" className="form-control" value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-success btn-sm">Save</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setAddingContact(false)}>Cancel</button>
            </div>
          </form>
        )}

        {emergencyContacts.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No emergency contacts added.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {emergencyContacts.map((c) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{c.name} <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '400' }}>({c.relation})</span></div>
                  <div style={{ fontSize: '13px', color: 'var(--primary)' }}>{c.phone}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <a href={`tel:${c.phone}`} className="btn btn-success btn-sm">📞 Call</a>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteContact(c.id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyPage;
