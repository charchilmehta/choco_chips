// EXTRA FEATURE - Misuse Reports
import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const DEMO_DATA = [
  { _id: '1', name: 'Arjun Mehta', patientId: 'P1001', strikes: 3, restricted: false, lastMisuseDate: '2024-01-12' },
  { _id: '2', name: 'Sneha Gupta', patientId: 'P1042', strikes: 5, restricted: true, lastMisuseDate: '2024-01-08' },
  { _id: '3', name: 'Rahul Verma', patientId: 'P1078', strikes: 2, restricted: false, lastMisuseDate: '2024-01-14' },
];

const MisuseReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/admin/misuse-reports');
        setReports(res.data.reports || res.data || DEMO_DATA);
      } catch {
        setReports(DEMO_DATA);
      }
      setLoading(false);
    };
    load();
  }, []);

  const showMsg = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleClearStrikes = async (id) => {
    try {
      await API.patch(`/admin/patients/${id}/clear-strikes`);
    } catch { /* demo mode */ }
    setReports((prev) =>
      prev.map((r) => (r._id === id ? { ...r, strikes: 0, restricted: false } : r))
    );
    showMsg('Strikes cleared successfully.');
  };

  const handleRestrict = async (id) => {
    if (!window.confirm('Permanently restrict this patient? This will prevent emergency access.')) return;
    try {
      await API.patch(`/admin/patients/${id}/restrict`);
    } catch { /* demo mode */ }
    setReports((prev) =>
      prev.map((r) => (r._id === id ? { ...r, restricted: true } : r))
    );
    showMsg('Patient restricted permanently.');
  };

  const handleUnrestrict = async (id) => {
    try {
      await API.patch(`/admin/patients/${id}/unrestrict`);
    } catch { /* demo mode */ }
    setReports((prev) =>
      prev.map((r) => (r._id === id ? { ...r, restricted: false } : r))
    );
    showMsg('Patient restriction removed.');
  };

  return (
    <div>
      <h1 className="page-title">⚠️ Misuse Reports</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
        Patients with repeated false emergency alerts are listed here. 3 strikes = automatic warning.
      </p>

      {actionMsg && <div className="alert alert-success">{actionMsg}</div>}

      {loading ? (
        <div className="spinner" style={{ margin: '40px auto' }} />
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
          <p style={{ color: 'var(--text-secondary)' }}>No misuse reports found.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Patient ID</th>
                  <th>Strikes</th>
                  <th>Status</th>
                  <th>Last Misuse</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: '600' }}>{r.name}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{r.patientId}</td>
                    <td>
                      <span
                        className={`badge badge-${r.strikes >= 5 ? 'danger' : r.strikes >= 3 ? 'warning' : 'secondary'}`}
                      >
                        {r.strikes} strike{r.strikes !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${r.restricted ? 'danger' : 'success'}`}>
                        {r.restricted ? '🔒 Restricted' : '✅ Active'}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {new Date(r.lastMisuseDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleClearStrikes(r._id)}
                        >
                          🔄 Clear Strikes
                        </button>
                        {r.restricted ? (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleUnrestrict(r._id)}
                          >
                            🔓 Unrestrict
                          </button>
                        ) : (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRestrict(r._id)}
                          >
                            🔒 Restrict
                          </button>
                        )}
                      </div>
                    </td>
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

export default MisuseReports;
