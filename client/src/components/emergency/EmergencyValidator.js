import React, { useState, useEffect, useRef } from 'react';
import { validateEmergency, triggerFailSafe } from '../../services/emergencyService';

const DURATION_OPTIONS = [
  { value: 'lt1h', label: 'Less than 1 hour' },
  { value: '1-6h', label: '1 – 6 hours' },
  { value: '6-24h', label: '6 – 24 hours' },
  { value: 'gt24h', label: 'More than 24 hours' },
];

const EmergencyValidator = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('lt1h');
  const [severity, setSeverity] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [listening, setListening] = useState(false);

  const abandonTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Trigger fail-safe if user abandons after 30 seconds without submitting
  useEffect(() => {
    abandonTimerRef.current = setTimeout(() => {
      if (!result) {
        triggerFailSafe({ reason: 'user_abandoned_after_30s', severity }).catch(() => {});
      }
    }, 30000);

    return () => {
      clearTimeout(abandonTimerRef.current);
    };
  }, [result, severity]);

  // EXTRA FEATURE - Web Speech API voice input
  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in your browser. Please type your symptoms.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSubmit = async () => {
    clearTimeout(abandonTimerRef.current);
    setLoading(true);
    try {
      const res = await validateEmergency({ symptoms, duration, severity });
      setResult(res.data);
    } catch {
      // Simulate a result if API is unavailable
      const score = Math.round((severity / 10) * 100);
      setResult({
        riskScore: score,
        riskLevel: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
        recommendation:
          score >= 70
            ? 'Seek immediate medical attention. Call 108 now.'
            : score >= 40
            ? 'Visit a hospital within 2-4 hours. Monitor symptoms.'
            : 'You may visit a nearby clinic. Rest and hydrate.',
        misuse: score < 30 && severity >= 8,
      });
    }
    setLoading(false);
  };

  const riskColor = (level) => {
    if (level === 'high') return '#c62828';
    if (level === 'medium') return '#e65100';
    return '#2e7d32';
  };

  if (result) {
    return (
      <div className="card fade-in">
        <h3 className="section-title">🤖 AI Emergency Assessment</h3>

        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            background: riskColor(result.riskLevel) + '18',
            borderRadius: '12px',
            marginBottom: '16px',
            border: `2px solid ${riskColor(result.riskLevel)}`,
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>
            {result.riskLevel === 'high' ? '🚨' : result.riskLevel === 'medium' ? '⚠️' : '✅'}
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: riskColor(result.riskLevel),
            }}
          >
            Risk Score: {result.riskScore || Math.round(severity * 10)}%
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: riskColor(result.riskLevel),
              textTransform: 'uppercase',
              marginTop: '4px',
            }}
          >
            {result.riskLevel} Risk
          </div>
        </div>

        <div className="alert alert-info">
          <strong>Recommendation:</strong> {result.recommendation}
        </div>

        {result.misuse && (
          <div className="alert alert-warning">
            ⚠️ <strong>Notice:</strong> Repeated false emergency alerts may result in account
            restrictions. Please use emergency services responsibly.
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="btn btn-danger" onClick={() => { clearTimeout(abandonTimerRef.current); if (onClose) onClose(); }}>
            🆘 Call 108 Now
          </button>
          <button className="btn btn-outline" onClick={() => { setResult(null); setStep(1); }}>
            Re-assess
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in">
      <h3 className="section-title">🤖 AI Emergency Assessment</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
        Answer a few quick questions so we can assess the urgency.
      </p>

      {/* Step indicators */}
      <div className="steps">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`step ${step === s ? 'active' : step > s ? 'completed' : ''}`}>
              <div className="step-number">{step > s ? '✓' : s}</div>
            </div>
            {s < 3 && <div className="step-divider" />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div>
          <div className="form-group">
            <label>Describe your symptoms *</label>
            <textarea
              className="form-control"
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. chest pain, difficulty breathing, dizziness..."
            />
          </div>
          {/* EXTRA FEATURE - Voice input */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={startVoiceInput}
            disabled={listening}
          >
            {listening ? '🔴 Listening...' : '🎤 Voice Input'}
          </button>
          <div style={{ marginTop: '16px' }}>
            <button
              className="btn btn-primary"
              onClick={() => setStep(2)}
              disabled={!symptoms.trim()}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="form-group">
            <label>How long have you had these symptoms?</label>
            <select
              className="form-control"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Next →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="form-group">
            <label>Severity (1 = mild, 10 = extremely severe): <strong>{severity}</strong></label>
            <input
              type="range"
              min={1}
              max={10}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              style={{ marginTop: '8px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>1 - Mild</span>
              <span>10 - Severe</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-danger" onClick={handleSubmit} disabled={loading}>
              {loading ? '⏳ Assessing...' : '🔍 Assess Emergency'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyValidator;
