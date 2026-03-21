import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const ChatPanel = ({ roomId, socket, participantName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('chat-message', handleMessage);

    return () => {
      socket.off('chat-message', handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    const msg = {
      sender: user?.name || 'You',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      self: true,
    };

    socket.emit('chat-message', { ...msg, roomId, self: false });
    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        width: '280px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          background: 'var(--primary)',
          color: '#fff',
          padding: '12px 16px',
          fontWeight: '600',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        💬 In-Call Chat
        <span style={{ opacity: 0.8, fontSize: '12px', marginLeft: 'auto' }}>
          with {participantName}
        </span>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minHeight: '200px',
          maxHeight: '400px',
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
            No messages yet. Say hello! 👋
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.self ? 'flex-end' : 'flex-start',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
              {msg.sender} • {msg.timestamp}
            </span>
            <div
              style={{
                background: msg.self ? 'var(--primary)' : 'var(--bg)',
                color: msg.self ? '#fff' : 'var(--text)',
                padding: '8px 12px',
                borderRadius: msg.self ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                fontSize: '13px',
                maxWidth: '80%',
                lineHeight: '1.4',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '10px', borderTop: '1px solid var(--border)' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ fontSize: '13px', padding: '8px 10px' }}
        />
        <button className="btn btn-primary btn-sm" onClick={sendMessage} disabled={!input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
