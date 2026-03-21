// EXTRA FEATURE - Rule-based floating chatbot
import React, { useState, useRef, useEffect } from 'react';

const QA = [
  {
    patterns: ['book', 'appointment'],
    answer:
      '📅 To book an appointment:\n1. Go to "Appointments" in your dashboard\n2. Search and select a hospital\n3. Choose a doctor & specialization\n4. Pick an available date and time slot\n5. Describe your symptoms and confirm.',
  },
  {
    patterns: ['emergency'],
    answer:
      '🆘 In an emergency:\n• Press the large RED button on your dashboard\n• It will alert your emergency contacts and notify ambulance services\n• You can also call 108 (Ambulance) or 102 directly.',
  },
  {
    patterns: ['symptom'],
    answer:
      '🩺 Common symptoms to report:\n• Chest pain or tightness\n• Difficulty breathing\n• Persistent headache or dizziness\n• High fever (above 103°F)\n• Severe abdominal pain\n• Sudden numbness or weakness',
  },
  {
    patterns: ['doctor'],
    answer:
      '👨‍⚕️ To find a doctor:\n1. Go to Book Appointment\n2. Select a hospital near you\n3. Filter doctors by specialization\n4. View their availability and book a slot.',
  },
  {
    patterns: ['cancel'],
    answer:
      '❌ To cancel an appointment:\n1. Go to My Appointments\n2. Find the appointment you want to cancel\n3. Click "Cancel" and confirm.\nNote: Please cancel at least 2 hours in advance.',
  },
  {
    patterns: ['record', 'report'],
    answer:
      '📁 To view medical records:\n1. Go to "My Records" in the sidebar\n2. Select a visit to view diagnosis and prescriptions\n3. You can download prescriptions as text files.',
  },
  {
    patterns: ['video', 'call'],
    answer:
      '🎥 For video consultations:\n1. Book an appointment with video type\n2. At the scheduled time, go to "My Appointments"\n3. Click "Join Video Call"\n4. Allow camera & microphone access.',
  },
  {
    patterns: ['help'],
    answer:
      '🤖 I can help you with:\n• appointment - Booking/cancelling appointments\n• emergency - Emergency procedures\n• symptom - Common symptoms\n• doctor - Finding doctors\n• record / report - Medical records\n• video / call - Video consultations\n\nJust type any of these keywords!',
  },
];

const getAnswer = (input) => {
  const lower = input.toLowerCase();
  for (const qa of QA) {
    if (qa.patterns.some((p) => lower.includes(p))) {
      return qa.answer;
    }
  }
  return "I can help with appointments, emergencies, and health queries. Type 'help' for all available topics.";
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "👋 Hello! I'm your HealthCare Pro assistant. How can I help you today? Type 'help' to see what I can do." },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input.trim() };
    const botReply = { from: 'bot', text: getAnswer(input.trim()) };
    setMessages((prev) => [...prev, userMsg, botReply]);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') send();
  };

  return (
    <>
      <button
        className="chatbot-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle chatbot"
        title="AI Assistant"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="chatbot-panel fade-in">
          <div className="chatbot-header">
            <span>🤖 HealthCare Assistant</span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-msg ${msg.from}`}
                style={{ whiteSpace: 'pre-line' }}
              >
                {msg.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              style={{ fontSize: '13px', padding: '8px 10px' }}
            />
            <button className="btn btn-primary btn-sm" onClick={send} disabled={!input.trim()}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
