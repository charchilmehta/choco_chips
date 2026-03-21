import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import ChatPanel from './ChatPanel';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const VideoCall = ({ roomId, participantName = 'Remote User', onEnd }) => {
  const [localStream, setLocalStream] = useState(null);
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);
  }, []);

  const createPeer = useCallback((stream) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setConnected(true);
      startTimer();
    };

    peer.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', { candidate: event.candidate, roomId });
      }
    };

    return peer;
  }, [roomId, startTimer]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    const socket = socketRef.current;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        peerRef.current = createPeer(stream);

        socket.emit('join-room', { roomId });

        socket.on('user-joined', async () => {
          const offer = await peerRef.current.createOffer();
          await peerRef.current.setLocalDescription(offer);
          socket.emit('offer', { offer, roomId });
        });

        socket.on('offer', async ({ offer }) => {
          if (!peerRef.current) peerRef.current = createPeer(stream);
          await peerRef.current.setRemoteDescription(offer);
          const answer = await peerRef.current.createAnswer();
          await peerRef.current.setLocalDescription(answer);
          socket.emit('answer', { answer, roomId });
        });

        socket.on('answer', async ({ answer }) => {
          await peerRef.current.setRemoteDescription(answer);
        });

        socket.on('ice-candidate', async ({ candidate }) => {
          try {
            await peerRef.current.addIceCandidate(candidate);
          } catch {
            // Silently ignore ICE errors
          }
        });
      } catch {
        // FALLBACK - simulated call mode
        setSimulated(true);
        startTimer();
      }
    };

    initMedia();

    return () => {
      clearInterval(timerRef.current);
      socket.disconnect();
      if (peerRef.current) peerRef.current.close();
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = muted;
      });
      setMuted((m) => !m);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => {
        t.enabled = cameraOff;
      });
      setCameraOff((c) => !c);
    }
  };

  const handleEnd = () => {
    clearInterval(timerRef.current);
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    if (peerRef.current) peerRef.current.close();
    if (socketRef.current) socketRef.current.disconnect();
    if (onEnd) onEnd();
  };

  return (
    <div style={{ display: 'flex', gap: '16px', height: '100%' }}>
      <div style={{ flex: 1 }}>
        {simulated ? (
          /* FALLBACK simulated call mode */
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              color: '#ffffff',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <div style={{ fontSize: '80px' }}>👨‍⚕️</div>
            <h3>Simulated Call Mode</h3>
            <p style={{ opacity: 0.7, fontSize: '14px' }}>
              Camera/microphone unavailable. Running in simulation mode.
            </p>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#4CAF50' }}>
              ⏱ {formatDuration(callDuration)}
            </div>
            <p style={{ opacity: 0.8 }}>{participantName}</p>
          </div>
        ) : (
          <div className="video-container">
            <div className="video-grid" style={{ minHeight: '300px' }}>
              <div style={{ position: 'relative', background: '#000', borderRadius: '8px', overflow: 'hidden', minHeight: '200px' }}>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '200px' }}
                />
                {!connected && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#111' }}>
                    <div className="spinner" style={{ borderTopColor: '#4CAF50' }} />
                    <p style={{ marginTop: '12px', fontSize: '13px' }}>Waiting for {participantName}...</p>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  {participantName}
                </div>
              </div>

              <div style={{ position: 'relative', background: '#000', borderRadius: '8px', overflow: 'hidden', minHeight: '200px' }}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '200px', transform: 'scaleX(-1)' }}
                />
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  You
                </div>
              </div>
            </div>

            <div className="video-controls">
              <div style={{ color: '#4CAF50', fontWeight: '600', fontSize: '14px' }}>
                ⏱ {formatDuration(callDuration)}
              </div>

              <button
                className="control-btn"
                onClick={toggleMute}
                title={muted ? 'Unmute' : 'Mute'}
                style={muted ? { background: 'rgba(244,67,54,0.5)' } : {}}
              >
                {muted ? '🔇' : '🎤'}
              </button>

              <button
                className="control-btn end-call"
                onClick={handleEnd}
                title="End Call"
              >
                📵
              </button>

              <button
                className="control-btn"
                onClick={toggleCamera}
                title={cameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                style={cameraOff ? { background: 'rgba(244,67,54,0.5)' } : {}}
              >
                {cameraOff ? '📷' : '📹'}
              </button>

              <button
                className="control-btn"
                onClick={() => setChatOpen((c) => !c)}
                title="Toggle Chat"
                style={chatOpen ? { background: 'rgba(33,150,243,0.5)' } : {}}
              >
                💬
              </button>
            </div>
          </div>
        )}
      </div>

      {chatOpen && (
        <ChatPanel
          roomId={roomId}
          socket={socketRef.current}
          participantName={participantName}
        />
      )}
    </div>
  );
};

export default VideoCall;
