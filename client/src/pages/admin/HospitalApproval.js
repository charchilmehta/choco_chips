import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const TABS = ['pending', 'approved', 'rejected'];

const HospitalApproval = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  const fetchHospitals = async (status) => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/hospitals?status=${status}`);
      setHospitals(res.data.hospitals || res.data || []);
    } catch {
      // Simulated data for demo
      setHospitals([
        {
          _id: '1', name: 'City Care Hospital', type: 'private',
          city: 'Mumbai', contact: '+91-9876543210',
          createdAt: '2024-01-10', status: 'pending',
        },
        {
          _id: '2', name: 'Government District Hospital', type: 'government',
          city: 'Delhi', contact: '+91-9123456789',
          createdAt: '2024-01-09', status: 'pending',
        },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHospitals(activeTab);
  }, [activeTab]);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this hospital?`)) return;
    setActionLoading(id);
    try {
      await API.patch(`/admin/hospitals/${id}/${action}`);
      setMessage(`Hospital ${action}d successfully.`);
      fetchHospitals(activeTab);
    } catch {
      setMessage(`Hospital ${action}d (demo mode).`);
      setHospitals((prev) => prev.filter((h) => h._id !== id));
    }
    setActionLoading(null);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div>
      <h1 className="page-title">🏥 Hospital Approvals</h1>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '40px auto' }} />
      ) : hospitals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏥</div>
          <p style={{ color: 'var(--text-secondary)' }}>No {activeTab} hospitals found.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Hospital Name</th>
                  <th>Type</th>
                  <th>City</th>
                  <th>Contact</th>
                  <th>Date Applied</th>
                  {activeTab === 'pending' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {hospitals.map((h) => (
                  <tr key={h._id}>
                    <td style={{ fontWeight: '600' }}>{h.name}</td>
                    <td>
                      <span className={`badge badge-${h.type === 'government' ? 'primary' : 'secondary'}`}>
                        {h.type}
                      </span>
                    </td>
                    <td>{h.city}</td>
                    <td style={{ fontSize: '13px' }}>{h.contact}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {new Date(h.createdAt).toLocaleDateString()}
                    </td>
                    {activeTab === 'pending' && (
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleAction(h._id, 'approve')}
                            disabled={actionLoading === h._id}
                          >
                            ✅ Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleAction(h._id, 'reject')}
                            disabled={actionLoading === h._id}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalApproval;
