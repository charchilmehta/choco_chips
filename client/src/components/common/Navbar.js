import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme(); // EXTRA FEATURE
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'doctor') return '/doctor';
    return '/patient';
  };

  const getRoleLinks = () => {
    if (!user) return [];
    if (user.role === 'admin') {
      return [
        { to: '/admin', label: '📊 Overview' },
        { to: '/admin/hospitals', label: '🏥 Hospitals' },
        { to: '/admin/misuse', label: '⚠️ Misuse Reports' },
      ];
    }
    if (user.role === 'doctor') {
      return [
        { to: '/doctor', label: '📋 Dashboard' },
        { to: '/doctor/records', label: '📁 Patient Records' },
      ];
    }
    return [
      { to: '/patient', label: '🏠 Home' },
      { to: '/patient/appointments', label: '📅 Appointments' },
      { to: '/patient/emergency', label: '🆘 Emergency' },
      { to: '/patient/records', label: '📁 My Records' },
    ];
  };

  return (
    <nav className="navbar">
      <Link to={getDashboardLink()} className="nav-brand">
        🏥 HealthCare Pro
      </Link>

      <ul className="nav-links" style={{ display: menuOpen || window.innerWidth > 768 ? 'flex' : 'none' }}>
        {isAuthenticated &&
          getRoleLinks().map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}

        {/* EXTRA FEATURE - dark mode toggle */}
        <li>
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '6px',
              borderRadius: '6px',
              transition: 'background 0.2s',
            }}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </li>

        {isAuthenticated ? (
          <li>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '8px' }}>
              {user?.name}
            </span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </li>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-link">Login</Link>
            </li>
            <li>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </li>
          </>
        )}
      </ul>

      {/* Hamburger for mobile */}
      <button
        onClick={() => setMenuOpen((o) => !o)}
        style={{
          display: 'none',
          background: 'transparent',
          border: 'none',
          fontSize: '22px',
          cursor: 'pointer',
          color: 'var(--text)',
        }}
        className="hamburger"
        aria-label="Toggle menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <style>{`
        @media (max-width: 768px) {
          .hamburger { display: block !important; }
          .nav-links { display: ${menuOpen ? 'flex' : 'none'} !important; flex-direction: column; position: absolute; top: 64px; left: 0; right: 0; background: var(--card-bg); padding: 12px; box-shadow: var(--shadow); z-index: 99; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
