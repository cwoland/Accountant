import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAccountChat from '../hooks/useAccountChat';
import useStore from '../store/useStore';
import Loader from './ui/Loader';

export default function AccountChat({ accountId, accountName }) {
  const { user } = useStore();
  const { messages, loading, sending, send } = useAccountChat(accountId);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    await send(text);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 420, marginTop: 20,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-l)',
      overflow: 'hidden',
    }}>

      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-2)',
      }}>
        <MessageCircle size={16} color="var(--accent-2)" />
        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
          Чат · {accountName}
        </p>
        <div style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--green-dim)', padding: '3px 10px', borderRadius: 99,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--green)',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--green)', fontWeight: 600 }}>
            Онлайн
          </span>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {loading && messages.length === 0
          ? <Loader size={24} text="Загружаем чат..." />
          : messages.length === 0
            ? <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.82rem', marginTop: 40 }}>
                Пока нет сообщений. Напишите первым!
              </div>
            : messages.map((msg) => {
                const isMe = msg.user._id === user?._id || msg.user === user?._id;
                return (
                  <motion.div key={msg._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                      gap: 8,
                      alignItems: 'flex-end',
                    }}
                  >
                    {!isMe && (
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-2)',
                      }}>
                        {msg.user.avatar || msg.user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div style={{ maxWidth: '70%' }}>
                      {!isMe && (
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 3, paddingLeft: 2 }}>
                          {msg.user.name}
                        </p>
                      )}
                      <div style={{
                        padding: '8px 12px',
                        background: isMe ? 'var(--accent)' : 'var(--surface-2)',
                        borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                        color: isMe ? '#fff' : 'var(--text-1)',
                        fontSize: '0.875rem', lineHeight: 1.5,
                        boxShadow: isMe ? '0 0 12px var(--accent-glow)' : 'none',
                      }}>
                        {msg.text}
                      </div>
                      <p style={{
                        fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 3,
                        textAlign: isMe ? 'right' : 'left', paddingLeft: isMe ? 0 : 2,
                      }}>
                        {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })
        }
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: 8, alignItems: 'flex-end',
        background: 'var(--bg-2)',
      }}>
        <textarea
          placeholder="Написать сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          rows={1}
          style={{
            flex: 1, background: 'var(--surface)',
            border: '1px solid var(--border-2)', borderRadius: 'var(--radius-m)',
            padding: '9px 12px', color: 'var(--text-1)', fontSize: '0.875rem',
            resize: 'none', lineHeight: 1.5, maxHeight: 80, overflowY: 'auto',
            fontFamily: 'var(--font-body)',
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim() || sending}
          style={{
            width: 38, height: 38, borderRadius: 'var(--radius-m)', flexShrink: 0,
            background: input.trim() && !sending ? 'var(--accent)' : 'var(--surface-2)',
            color: input.trim() && !sending ? '#fff' : 'var(--text-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
            boxShadow: input.trim() && !sending ? 'var(--shadow-glow)' : 'none',
            transition: 'var(--transition)', border: 'none',
          }}
        >
          {sending
            ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            : <Send size={16} />
          }
        </motion.button>
      </div>
    </div>
  );
}