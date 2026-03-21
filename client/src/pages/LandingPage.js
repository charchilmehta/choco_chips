import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const FEATURES = [
  { icon: '📅', title: 'Smart Scheduling', desc: 'AI-powered appointment booking with real-time slot availability.' },
  { icon: '🏥', title: 'Hospital Network', desc: 'Access 50+ partner hospitals across cities with verified doctors.' },
  { icon: '🆘', title: 'Emergency Response', desc: 'One-tap emergency alert system notifying contacts and ambulance.' },
  { icon: '🎥', title: 'Video Consultations', desc: 'HD video calls with doctors from the comfort of your home.' },
  { icon: '📊', title: 'Health Monitoring', desc: 'Track vitals and get AI-driven health recommendations.' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Intelligent chatbot for health queries and appointment guidance.' },
];

const STATS = [
  { number: '10,000+', label: 'Patients Served' },
  { number: '500+', label: 'Verified Doctors' },
  { number: '50+', label: 'Partner Hospitals' },
  { number: '24/7', label: 'Emergency Support' },
];

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user?.role === 'admin') navigate('/admin');
      else if (user?.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } else {
      navigate('/register');
    }
  };

  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1565C0 0%, #2196F3 50%, #26C6DA 100%)',
          color: '#fff',
          padding: '80px 20px',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>🏥</div>
          <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px', lineHeight: 1.2 }}>
            AI-Powered Healthcare
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Smart Patient Management System — book appointments, get emergency help, consult doctors via video, and track your health — all in one place.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-lg" onClick={handleGetStarted}
              style={{ background: '#fff', color: '#1565C0', fontWeight: '700' }}>
              🚀 Get Started
            </button>
            <Link to="/patient/emergency" className="btn btn-lg"
              style={{ background: 'rgba(244,67,54,0.9)', color: '#fff', border: '2px solid rgba(255,255,255,0.5)' }}>
              🆘 Emergency
            </Link>
          </div>
          <p style={{ marginTop: '20px', fontSize: '13px', opacity: 0.75 }}>
            Helpline: 108 (Ambulance) | 102 | 100 (Police) | 1091 (Women)
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--card-bg)', padding: '48px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="grid-4">
            {STATS.map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="stat-number">{s.number}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '64px 20px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>
            Why Choose HealthCare Pro?
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>
            Everything you need for modern, AI-powered healthcare management.
          </p>
          <div className="grid-3">
            {FEATURES.map((f) => (
              <div className="card" key={f.title} style={{ textAlign: 'center', padding: '28px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
                  {f.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #b71c1c, #e53935)',
          color: '#fff',
          padding: '64px 20px',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🆘</div>
          <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '12px' }}>
            In Case of Emergency
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9, maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Your safety is our priority. One tap alerts emergency contacts, notifies the nearest ambulance, and connects you to 108.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <button
              className="red-emergency-btn"
              onClick={() => alert('Please login to use emergency features.')}
              style={{ margin: '0 auto' }}
            >
              <span style={{ fontSize: '24px' }}>🆘</span>
              <span>EMERGENCY</span>
              <span style={{ fontSize: '10px', opacity: 0.9 }}>TAP NOW</span>
            </button>
          </div>
          <p style={{ opacity: 0.85, fontSize: '15px', fontWeight: '600' }}>
            📞 108 (Ambulance) | 102 | 100 (Police) | 1091 (Women Helpline)
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 20px', textAlign: 'center', background: 'var(--card-bg)' }}>
        <div className="container">
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px', color: 'var(--text)' }}>
            Ready to Take Control of Your Health?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Join thousands of patients managing their health smartly.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
              Create Free Account
            </button>
            <Link to="/register-hospital" className="btn btn-outline btn-lg">
              🏥 Register Hospital
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
