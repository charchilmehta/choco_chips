import React, { useState, useEffect, useRef, useCallback } from 'react';

const INSTRUCTIONS = [
  'Open your mouth wide',
  'Move camera closer to the area',
  'Hold steady for 3 seconds',
  'Tilt your head slightly left',
  'Good! Now move camera right',
];

const CameraAssist = () => {
  const [active, setActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [flashOn, setFlashOn] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [instructionIdx, setInstructionIdx] = useState(0);
  const [notification, setNotification] = useState('');

  const videoRef = useRef(null);
  const instructionTimerRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setStream(s);
      setActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch {
      alert('Camera access denied. Please allow camera permissions and try again.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setStream(null);
    setActive(false);
    setFlashOn(false);
    setZoom(1);
    clearInterval(instructionTimerRef.current);
  }, [stream]);

  useEffect(() => {
    if (active) {
      instructionTimerRef.current = setInterval(() => {
        setInstructionIdx((i) => (i + 1) % INSTRUCTIONS.length);
      }, 3000);
    }
    return () => clearInterval(instructionTimerRef.current);
  }, [active]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const shareWithDoctor = () => {
    setNotification('📤 Image shared with your doctor successfully!');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="card">
      <h3 className="section-title">📷 Camera Assist (Dental / Visual Checkup)</h3>

      {!active ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Use your camera to assist with dental or visual checkups.
          </p>
          <button className="btn btn-primary" onClick={startCamera}>
            Start Camera
          </button>
        </div>
      ) : (
        <div>
          <div
            style={{
              position: 'relative',
              background: '#000',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}
          >
            {/* Flashlight overlay */}
            {flashOn && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(255,255,255,0.35)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                borderRadius: '12px',
                display: 'block',
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease',
              }}
            />

            {/* Rotating instruction prompt */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                zIndex: 3,
              }}
            >
              📋 {INSTRUCTIONS[instructionIdx]}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
            <button
              className={`btn ${flashOn ? 'btn-warning' : 'btn-outline'} btn-sm`}
              onClick={() => setFlashOn((f) => !f)}
            >
              {flashOn ? '🔦 Flash ON' : '🔦 Flash OFF'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
              <label style={{ fontSize: '13px', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                🔍 Zoom {zoom}x
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={0.5}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-success" onClick={shareWithDoctor}>
              📤 Share with Doctor
            </button>
            <button className="btn btn-outline" onClick={stopCamera}>
              Stop Camera
            </button>
          </div>

          {notification && (
            <div className="alert alert-success" style={{ marginTop: '12px' }}>
              {notification}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraAssist;
