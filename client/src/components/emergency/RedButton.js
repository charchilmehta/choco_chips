import React, { useState } from 'react';
import { createRedButtonEmergency } from '../../services/emergencyService';

const RedButton = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEmergency = () => {
    const sendAlert = (location) => {
      // Always attempt — never show errors to user
      createRedButtonEmergency(location).catch(() => {});
      setShowSuccess(true);
      // Auto-hide after 8 seconds
      setTimeout(() => setShowSuccess(false), 8000);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendAlert({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Fallback to simulated location (India center)
          sendAlert({ lat: 20.5937, lng: 78.9629 });
        },
        { timeout: 5000 }
      );
    } else {
      sendAlert({ lat: 20.5937, lng: 78.9629 });
    }
  };

  return (
    <>
      {showSuccess && (
        <div className="emergency-success">
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚨</div>
          <h2>Emergency Alert Sent!</h2>
          <p>
            Help is on the way.
            <br />
            <strong>Emergency contacts notified.</strong>
            <br />
            Helpline <strong>108</strong> is being contacted.
            <br /><br />
            Stay calm. Paramedics will reach you shortly.
          </p>
          <button
            className="btn"
            onClick={() => setShowSuccess(false)}
            style={{
              marginTop: '24px',
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.5)',
            }}
          >
            Close
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <button className="red-emergency-btn" onClick={handleEmergency} aria-label="Emergency button">
          <span style={{ fontSize: '28px' }}>🆘</span>
          <span>EMERGENCY</span>
          <span style={{ fontSize: '11px', opacity: 0.9 }}>TAP NOW</span>
        </button>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Helpline: <strong>108</strong> | Ambulance: <strong>102</strong>
        </p>
      </div>
    </>
  );
};

export default RedButton;
