import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import RedButton from '../../components/emergency/RedButton';
import HealthMonitor from '../../components/health/HealthMonitor';
import Chatbot from '../../components/chatbot/Chatbot';
import AppointmentBooking from './AppointmentBooking';
import EmergencyPage from './EmergencyPage';
import MyRecords from './MyRecords';
import Profile from './Profile';
import API from '../../services/api';

const SIDEBAR_LINKS = [
  { to: '/patient', label: '🏠 Dashboard', exact: true },
  { to: '/patient/appointments', label: '📅 Book Appointment' },
  { to: '/patient/emergency', label: '🆘 Emergency' },
  { to: '/patient/records', label: '📁 My Records' },
  { to: '/patient/health', label: '📊 Health Monitor' },
  { to: '/patient/profile', label: '👤 Profile' },
];

const PatientOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/appointments?upcoming=true');
        setAppointments(res.data.appointments || res.data || []);
      } catch {
        setAppointments([
          { _id: '1', doctorName: 'Dr. Anita Roy', date: '2024-02-05', time: '10:00 AM', type: 'general', status: 'confirmed' },
          { _id: '2', doctorName: 'Dr. Rakesh Mehta', date: '2024-02-08', time: '03:00 PM', type: 'video', status: 'pending' },
        ]);
      }

      setNotifications([
        { id: 1, msg: '✅ Appointment with Dr. Anita Roy confirmed for Feb 5', time: '2 hours ago' },
        { id: 2, msg: '💊 Prescription ready for download', time: '1 day ago' },
      ]);

      try {
        const mRes = await API.get('/health/metrics/latest');
        setMetrics(mRes.data);
      } catch {
        setMetrics({ bpSystolic: 118, bpDiastolic: 78, heartRate: 72, bloodSugar: 95 });
      }
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="page-title">Welcome, {user?.name} 👋</h1>

      {/* Red Emergency Button */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #fff8f8, #fff)', border: '2px solid #ffcdd2', textAlign: 'center', padding: '28px' }}>
        <h3 style={{ color: '#c62828', marginBottom: '16px', fontWeight: '700' }}>🆘 Emergency? Act Now!</h3>
        <RedButton />
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Or{' '}
          <Link to="/patient/emergency" style={{ color: 'var(--danger)', fontWeight: '600' }}>
            go to Emergency Hub →
          </Link>
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid-4" style={{ marginBottom: '16px' }}>
        <button className="card" onClick={() => navigate('/patient/appointments')}
          style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid var(--primary)', padding: '20px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📅</div>
          <div style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '13px' }}>Book Appointment</div>
        </button>
        <button className="card" onClick={() => navigate('/patient/records')}
          style={{ textAlign: 'center', cursor: 'pointer', padding: '20px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📁</div>
          <div style={{ fontWeight: '600', fontSize: '13px' }}>My Records</div>
        </button>
        <button className="card" onClick={() => navigate('/patient/health')}
          style={{ textAlign: 'center', cursor: 'pointer', padding: '20px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
          <div style={{ fontWeight: '600', fontSize: '13px' }}>Update Health</div>
        </button>
        <button className="card" onClick={() => navigate('/video/demo')}
          style={{ textAlign: 'center', cursor: 'pointer', padding: '20px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎥</div>
          <div style={{ fontWeight: '600', fontSize: '13px' }}>Video Call</div>
        </button>
      </div>

      <div className="grid-2">
        {/* Upcoming Appointments */}
        <div className="card">
          <h3 className="section-title">📅 Upcoming Appointments</h3>
          {appointments.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No upcoming appointments.</p>
          ) : (
            appointments.slice(0, 3).map((a) => (
              <div key={a._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{a.doctorName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {a.date} at {a.time}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className={`badge badge-${a.status === 'confirmed' ? 'success' : 'warning'}`}>
                    {a.status}
                  </span>
                  {a.type === 'video' && (
                    <Link to={`/video/${a._id}`} className="btn btn-primary btn-sm">🎥 Join</Link>
                  )}
                </div>
              </div>
            ))
          )}
          <Link to="/patient/appointments" style={{ display: 'block', textAlign: 'center', marginTop: '12px', color: 'var(--primary)', fontSize: '13px', fontWeight: '600' }}>
            Book New Appointment →
          </Link>
        </div>

        {/* Notifications */}
        <div>
          {/* Recent Health Metrics */}
          {metrics && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 className="section-title">💓 Recent Health Metrics</h3>
              <div className="grid-2">
                {[
                  { label: 'BP', value: `${metrics.bpSystolic}/${metrics.bpDiastolic}`, unit: 'mmHg' },
                  { label: 'Heart Rate', value: metrics.heartRate, unit: 'bpm' },
                  { label: 'Blood Sugar', value: metrics.bloodSugar, unit: 'mg/dL' },
                ].map((m) => (
                  <div key={m.label} style={{ textAlign: 'center', padding: '10px', background: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{m.label}</div>
                    <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--primary)' }}>{m.value}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{m.unit}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="section-title">🔔 Notifications</h3>
            {notifications.map((n) => (
              <div key={n.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                <div>{n.msg}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientDashboard = () => {
  const location = useLocation();

  return (
    <div>
      <Navbar />
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div style={{ padding: '16px 20px 8px', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Patient Portal
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
            <Route index element={<PatientOverview />} />
            <Route path="appointments" element={<AppointmentBooking />} />
            <Route path="emergency" element={<EmergencyPage />} />
            <Route path="records" element={<MyRecords />} />
            <Route path="health" element={<HealthMonitor />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>

      <Chatbot />
    </div>
  );
};

export default PatientDashboard;
