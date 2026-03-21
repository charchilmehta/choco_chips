import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import PatientRecords from './PatientRecords';
import API from '../../services/api';

const SIDEBAR_LINKS = [
  { to: '/doctor', label: '📋 Dashboard', exact: true },
  { to: '/doctor/records', label: '📁 Patient Records' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: '🟢 Available', color: '#2e7d32' },
  { value: 'busy', label: '🟡 Busy', color: '#e65100' },
  { value: 'offline', label: '🔴 Offline', color: '#c62828' },
];

const DoctorOverview = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState('available'); // EXTRA FEATURE

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/appointments?role=doctor&date=today');
        setAppointments(res.data.appointments || res.data || []);
      } catch {
        setAppointments([
          { _id: '1', patientName: 'Ravi Sharma', time: '10:00 AM', type: 'general', status: 'confirmed' },
          { _id: '2', patientName: 'Meera Patel', time: '11:30 AM', type: 'video', status: 'confirmed' },
          { _id: '3', patientName: 'Suresh Kumar', time: '02:00 PM', type: 'general', status: 'pending' },
        ]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleAvailabilityChange = async (val) => {
    setAvailability(val);
    try {
      await API.patch('/doctors/availability', { status: val });
    } catch { /* demo mode - just update local state */ }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.patch(`/appointments/${id}/status`, { status });
    } catch { /* demo */ }
    setAppointments((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status } : a))
    );
  };

  const avOpt = AVAILABILITY_OPTIONS.find((o) => o.value === availability);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Welcome, Dr. {user?.name} 👨‍⚕️
        </h1>
        {/* EXTRA FEATURE - Availability toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Status:</span>
          <select
            className="form-control"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '13px', color: avOpt?.color }}
            value={availability}
            onChange={(e) => handleAvailabilityChange(e.target.value)}
          >
            {AVAILABILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">📅 Today's Appointments</h3>
        {loading ? (
          <div className="spinner" />
        ) : appointments.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No appointments today.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: '600' }}>{a.patientName}</td>
                    <td>{a.time}</td>
                    <td>
                      <span className={`badge badge-${a.type === 'video' ? 'primary' : 'secondary'}`}>
                        {a.type === 'video' ? '🎥 Video' : '🏥 In-Person'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${a.status === 'confirmed' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {a.status === 'pending' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(a._id, 'confirmed')}>
                            ✅ Confirm
                          </button>
                        )}
                        {a.type === 'video' && (
                          <Link to={`/video/${a._id}`} className="btn btn-primary btn-sm">
                            🎥 Join
                          </Link>
                        )}
                        <button className="btn btn-outline btn-sm" onClick={() => handleUpdateStatus(a._id, 'completed')}>
                          Done
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="section-title">🔍 Quick Patient Lookup</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by patient name or ID..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') window.location.href = '/doctor/records';
            }}
          />
          <Link to="/doctor/records" className="btn btn-primary">Search</Link>
        </div>
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const location = useLocation();

  return (
    <div>
      <Navbar />
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div style={{ padding: '16px 20px 8px', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Doctor Portal
          </div>
          {SIDEBAR_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-item ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </aside>

        <main className="main-content">
          <Routes>
            <Route index element={<DoctorOverview />} />
            <Route path="records" element={<PatientRecords />} />
            <Route path="records/:patientId" element={<PatientRecords />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
