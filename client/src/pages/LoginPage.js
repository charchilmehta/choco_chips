import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false); // EXTRA FEATURE
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      // EXTRA FEATURE - remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', form.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      // Redirect based on role
      if (user?.role === 'admin') navigate('/admin');
      else if (user?.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <div
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'var(--bg)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏥</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>Welcome Back</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                Sign in to HealthCare Pro
              </p>
            </div>

            {error && (
              <div className="alert alert-danger">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* EXTRA FEATURE - Remember me */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '14px', cursor: 'pointer', color: 'var(--text)' }}>
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
                style={{ marginBottom: '12px' }}
              >
                {loading ? '⏳ Signing in...' : '🔐 Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                Register here
              </Link>
            </p>

            <div style={{ borderTop: '1px solid var(--border)', marginTop: '16px', paddingTop: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Are you a hospital?
              </p>
              <Link to="/register-hospital" style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: '600' }}>
                🏥 Register Hospital
              </Link>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
            Emergency? Call <strong>108</strong> immediately
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
