import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import VideoCall from '../components/video/VideoCall';
import CameraAssist from '../components/camera/CameraAssist';
import Navbar from '../components/common/Navbar';

const VideoRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [inCall, setInCall] = useState(false);
  const [showCameraAssist, setShowCameraAssist] = useState(false);

  // Extract appointment info from router state or use defaults
  const appointmentInfo = location.state || {
    doctorName: 'Your Doctor',
    patientName: 'Patient',
    time: new Date().toLocaleTimeString(),
    type: 'general',
  };

  const isDentist = appointmentInfo.type === 'dentist';

  useEffect(() => {
    return () => {
      // Cleanup on unmount
    };
  }, []);

  if (!inCall) {
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
          <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎥</div>
            <h2 style={{ marginBottom: '8px', color: 'var(--text)' }}>Video Consultation</h2>

            <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Doctor: </span>
                <strong>{appointmentInfo.doctorName}</strong>
              </div>
              <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Patient: </span>
                <strong>{appointmentInfo.patientName}</strong>
              </div>
              <div style={{ fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Room ID: </span>
                <code style={{ background: 'var(--card-bg)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>
                  {roomId}
                </code>
              </div>
            </div>

            <div className="alert alert-info" style={{ textAlign: 'left', marginBottom: '20px' }}>
              📋 Ensure you are in a quiet, well-lit space. Your microphone and camera will be accessed.
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="video-btn" onClick={() => setInCall(true)}>
                🎥 Join Call
              </button>
              <button className="btn btn-outline" onClick={() => navigate(-1)}>
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <div
        style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <span style={{ color: '#fff', fontWeight: '600', fontSize: '15px' }}>
          🎥 HealthCare Pro — Video Consultation
        </span>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
            Dr. {appointmentInfo.doctorName}
          </span>

          {/* Camera Assist Mode toggle - show for dentist appointments */}
          {isDentist && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowCameraAssist((v) => !v)}
              style={{ borderColor: '#4CAF50', color: '#4CAF50', fontSize: '12px' }}
            >
              📷 {showCameraAssist ? 'Hide' : 'Camera Assist'}
            </button>
          )}

          <button
            className="btn btn-danger btn-sm"
            onClick={() => navigate(-1)}
          >
            ✕ Leave
          </button>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <VideoCall
          roomId={roomId}
          participantName={appointmentInfo.doctorName}
          onEnd={() => navigate(-1)}
        />

        {showCameraAssist && (
          <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '16px' }}>
            <CameraAssist />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRoom;
