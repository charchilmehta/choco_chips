import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import HospitalApproval from './HospitalApproval';
import MisuseReports from './MisuseReports';
import API from '../../services/api';

const SIDEBAR_LINKS = [
  { to: '/admin', label: '📊 Overview', exact: true },
  { to: '/admin/hospitals', label: '🏥 Hospital Approvals' },
  { to: '/admin/misuse', label: '⚠️ Misuse Reports' },
];

const Overview = () => {
  const [stats, setStats] = useState({ hospitals: 0, doctors: 0, patients: 0, emergencies: 0 });
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/admin/stats');
        setStats(res.data.stats || res.data);
        setEmergencies(res.data.recentEmergencies || []);
      } catch {
        setStats({ hospitals: 52, doctors: 487, patients: 10243, emergencies: 38 });
        setEmergencies([
          { id: 1, patientName: 'Ravi Kumar', type: 'Red Button', status: 'resolved', time: '2024-01-15 14:30' },
          { id: 2, patientName: 'Priya Sharma', type: 'Validated', status: 'pending', time: '2024-01-15 13:15' },
          { id: 3, patientName: 'Ankit Patel', type: 'Red Button', status: 'resolved', time: '2024-01-14 22:10' },
        ]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Hospitals', value: stats.hospitals, icon: '🏥', color: '#1565C0' },
    { label: 'Total Doctors', value: stats.doctors, icon: '👨‍⚕️', color: '#2e7d32' },
    { label: 'Total Patients', value: stats.patients, icon: '🧑‍⚕️', color: '#6a1b9a' },
    { label: 'Emergencies (30d)', value: stats.emergencies, icon: '🆘', color: '#c62828' },
  ];

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }} />;

  return (
    <div>
      <h1 className="page-title">📊 Admin Overview</h1>
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {statCards.map((s) => (
          <div className="stat-card" key={s.label}>
            <div style={{ fontSize: '32px', marginBottom: '6px' }}>{s.icon}</div>
            <div className="stat-number" style={{ color: s.color }}>{s.value?.toLocaleString()}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="section-title">🆘 Recent Emergency Events</h3>
        {emergencies.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No recent emergencies.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {emergencies.map((e) => (
                  <tr key={e.id || e._id}>
                    <td>{e.patientName}</td>
                    <td>{e.type}</td>
                    <td>
                      <span className={`badge badge-${e.status === 'resolved' ? 'success' : 'warning'}`}>
                        {e.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{e.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div>
      <Navbar />
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div style={{ padding: '16px 20px 8px', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Admin Panel
          </div>
          <div style={{ padding: '8px 20px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            👤 {user?.name}
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
            <Route index element={<Overview />} />
            <Route path="hospitals" element={<HospitalApproval />} />
            <Route path="misuse" element={<MisuseReports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
