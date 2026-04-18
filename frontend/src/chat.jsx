import React, { useState, useRef, useEffect } from 'react';
import { api } from './api';
import mascotImg from './assets/chatMascot.png';
import './chat.css';

function Chat({ onNext, t }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: t('chat_greeting') || "Hi! I'm YumZy orange 🧡 — your personal AI nutritionist. Ask me anything!" }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { role: 'user', text: message };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const data = await api.chat.sendMessage(message);
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: `Sorry, I couldn't process that: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat_page">
      <header className="chat_header">
        <button className="back_circle_btn" onClick={() => onNext('dashboard')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1>{t('chat_title')}</h1>
          <p className="chat_subtitle">{t('chat_subtitle')}</p>
        </div>
      </header>

      <div className="chat_messages_container">
        {messages.map((msg, i) => (
          <div key={i} className={`chat_bubble ${msg.role}`} style={{ animationDelay: `${i * 0.05}s` }}>
            {msg.role === 'bot' && <img src={mascotImg} alt="YumZy" className="bot_avatar" />}
            <div className="bubble_text">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="chat_bubble bot">
            <img src={mascotImg} alt="YumZy" className="bot_avatar" />
            <div className="bubble_text typing_indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef}></div>
      </div>

      <div className="chat_input_bar">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('ask_yumzy')}
          rows={1}
          disabled={loading}
        />
        <button className="send_btn" onClick={sendMessage} disabled={loading || !message.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}

export default Chat;