import { useState, useRef, useEffect } from 'react';
import { api } from '../api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am FleetForge AI. How can I help you manage your fleet today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}. Make sure your OpenAI API key is set in the backend .env file.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Animated Tooltip Label */}
      {!isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '36px',
          right: '90px',
          background: 'var(--bg-3)',
          color: 'var(--gold)',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 700,
          border: '1px solid var(--gold)',
          boxShadow: '0 4px 12px rgba(245,197,24,0.15)',
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          animation: 'floatLabel 2s ease-in-out infinite'
        }}>
          <style>
            {`
              @keyframes floatLabel {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-4px); }
                100% { transform: translateY(0px); }
              }
            `}
          </style>
          Ask FleetForge AI <i className="ti ti-sparkles" />
        </div>
      )}

      {/* Chat Toggle Button */}
      <button 
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          background: 'var(--gold)',
          color: 'var(--bg)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(245,197,24,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px', // Slightly larger for emoji
          zIndex: 9999,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(245,197,24,0.6)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,197,24,0.4)';
        }}
      >
        {isOpen ? <i className="ti ti-x" style={{ fontSize: '24px' }} /> : '🤖'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '350px',
          height: '500px',
          background: 'var(--bg-2)',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          border: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9998,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            background: 'var(--bg-3)',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '16px', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg)', fontSize: '18px' }}>
              <i className="ti ti-robot" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>FleetForge AI</div>
              <div style={{ fontSize: '12px', color: 'var(--cyan)' }}>Online</div>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((msg, i) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div key={i} style={{
                  alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {isAssistant && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-lo)', paddingLeft: '4px' }}>
                      <i className="ti ti-robot" style={{ color: 'var(--gold)' }} /> FleetForge AI
                    </div>
                  )}
                  <div style={{
                    background: isAssistant ? 'var(--bg-3)' : 'var(--gold)',
                    color: isAssistant ? 'var(--text-hi)' : 'var(--bg)',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    borderBottomRightRadius: isAssistant ? '12px' : '4px',
                    borderBottomLeftRadius: isAssistant ? '4px' : '12px',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-lo)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-loader" style={{ animation: 'spin 1s linear infinite' }} /> AI is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{
            padding: '12px',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            gap: '8px',
            background: 'var(--bg-3)'
          }}>
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about the fleet..."
              style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text-hi)', outline: 'none' }}
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              style={{
                width: '40px',
                borderRadius: '8px',
                background: input.trim() && !loading ? 'var(--gold)' : 'var(--bg-2)',
                color: input.trim() && !loading ? 'var(--bg)' : 'var(--text-lo)',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <i className="ti ti-send" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
