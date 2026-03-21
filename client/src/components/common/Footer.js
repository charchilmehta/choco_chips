import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p style={{ marginBottom: '6px', fontWeight: '600', color: 'var(--text)' }}>
          🏥 HealthCare Pro — AI-Powered Patient Management
        </p>
        <p style={{ marginBottom: '8px' }}>
          📞 Ambulance: <strong>108</strong> &nbsp;|&nbsp;
          Emergency: <strong>102</strong> &nbsp;|&nbsp;
          Police: <strong>100</strong> &nbsp;|&nbsp;
          Women Helpline: <strong>1091</strong>
        </p>
        <p>© {new Date().getFullYear()} HealthCare Pro. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
