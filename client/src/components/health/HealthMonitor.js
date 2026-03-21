import React, { useState } from 'react';
import { logMetrics, getHistory } from '../../services/healthService';

const METRICS = [
  { key: 'bpSystolic', label: 'BP Systolic (mmHg)', placeholder: 'e.g. 120', normal: [90, 130] },
  { key: 'bpDiastolic', label: 'BP Diastolic (mmHg)', placeholder: 'e.g. 80', normal: [60, 90] },
  { key: 'bloodSugar', label: 'Blood Sugar (mg/dL)', placeholder: 'e.g. 100', normal: [70, 140] },
  { key: 'heartRate', label: 'Heart Rate (bpm)', placeholder: 'e.g. 72', normal: [60, 100] },
];

const SUGGESTIONS = {
  bpSystolic: {
    low: 'Blood pressure seems low. Ensure adequate hydration and salt intake.',
    normal: 'Systolic BP is in the normal range. Keep it up!',
    high: 'High systolic BP. Reduce salt intake, exercise regularly, and consult a doctor.',
  },
  bpDiastolic: {
    low: 'Diastolic BP is low. Rest and stay hydrated.',
    normal: 'Diastolic BP is normal. Good job!',
    high: 'High diastolic BP. Limit caffeine, manage stress, consult a doctor.',
  },
  bloodSugar: {
    low: 'Blood sugar is low. Consume some fast-acting carbohydrates (juice/candy).',
    normal: 'Blood sugar is normal. Maintain a healthy diet.',
    high: 'High blood sugar. Limit sugar intake, exercise, and consult your doctor.',
  },
  heartRate: {
    low: 'Heart rate is lower than usual. Monitor and consult if persistent.',
    normal: 'Heart rate is normal. Stay active and healthy!',
    high: 'Elevated heart rate. Avoid stimulants, rest, and consult a doctor.',
  },
};

const getStatus = (key, value) => {
  const metric = METRICS.find((m) => m.key === key);
  if (!metric) return 'normal';
  if (value < metric.normal[0]) return 'low';
  if (value > metric.normal[1]) return 'high';
  return 'normal';
};

const statusColor = (status) => {
  if (status === 'normal') return '#2e7d32';
  if (status === 'low') return '#e65100';
  return '#c62828';
};

const HealthMonitor = () => {
  const [form, setForm] = useState({ bpSystolic: '', bpDiastolic: '', bloodSugar: '', heartRate: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(null);
  const [showHistory, setShowHistory] = useState(false); // EXTRA FEATURE

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await logMetrics(form);
      const analysed = {};
      Object.keys(form).forEach((key) => {
        const val = parseFloat(form[key]);
        if (!isNaN(val)) {
          analysed[key] = { value: val, status: getStatus(key, val) };
        }
      });
      setResults(analysed);
    } catch {
      setError('Failed to submit metrics. Please try again.');
    }
    setLoading(false);
  };

  // EXTRA FEATURE - load history
  const loadHistory = async () => {
    setShowHistory(true);
    try {
      const res = await getHistory();
      setHistory(res.data.history || res.data || []);
    } catch {
      setHistory([]);
    }
  };

  return (
    <div className="card">
      <h3 className="section-title">📊 Health Monitor</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          {METRICS.map((metric) => (
            <div className="form-group" key={metric.key}>
              <label>{metric.label}</label>
              <input
                type="number"
                name={metric.key}
                className="form-control"
                placeholder={metric.placeholder}
                value={form[metric.key]}
                onChange={handleChange}
                min={0}
              />
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '⏳ Submitting...' : '📊 Log & Analyze'}
        </button>
      </form>

      {results && (
        <div style={{ marginTop: '20px' }} className="fade-in">
          <h4 className="section-title">Results</h4>
          <div className="grid-2">
            {Object.entries(results).map(([key, { value, status }]) => {
              const metric = METRICS.find((m) => m.key === key);
              return (
                <div
                  key={key}
                  className="card"
                  style={{ padding: '16px', borderLeft: `4px solid ${statusColor(status)}` }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{metric?.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: statusColor(status) }}>
                    {value}
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: statusColor(status) + '22',
                      color: statusColor(status),
                      textTransform: 'capitalize',
                      marginBottom: '8px',
                      display: 'inline-block',
                    }}
                  >
                    {status === 'normal' ? '✅ Normal' : status === 'low' ? '⬇️ Low' : '⬆️ High'}
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {SUGGESTIONS[key]?.[status]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EXTRA FEATURE - Show history */}
      <div style={{ marginTop: '16px' }}>
        <button className="btn btn-outline btn-sm" onClick={loadHistory}>
          📈 View History
        </button>
      </div>

      {showHistory && (
        <div style={{ marginTop: '16px' }} className="fade-in">
          <h4 className="section-title">Health History</h4>
          {!history ? (
            <div className="spinner" />
          ) : history.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No history found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>BP (Sys/Dia)</th>
                    <th>Blood Sugar</th>
                    <th>Heart Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i}>
                      <td>{new Date(h.createdAt || h.date).toLocaleDateString()}</td>
                      <td>{h.bpSystolic}/{h.bpDiastolic}</td>
                      <td>{h.bloodSugar}</td>
                      <td>{h.heartRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthMonitor;
