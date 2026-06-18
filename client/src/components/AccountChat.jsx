import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import useAccountChat from '../hooks/useAccountChat';
import useStore from '../store/useStore';
import Card from './ui/Card';

export default function AccountChat({ accountId, accounts }) {
  const user = useStore((s) => s.user);
  const { messages, connected, send } = useAccountChat(accountId);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const account = accounts.find((a) => a._id === accountId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    send(text);
    setInput('');
  };

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 20px', borderBottom: '1px solid var(--border)',
      }}>
        <MessageCircle size={18} color="var(--accent-2)" />
        <p style={{ fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>
          Чат · {account?.name || 'Совместный счёт'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: connected ? 'var(--green)' : 'var(--text-3)',
          }} />
          <span style={{ fontSize: '0.72rem', color: connected ? 'var(--green)' : 'var(--text-3)' }}>
            {connected ? 'Online' : 'Офлайн'}
          </span>
        </div>
      </div>

      <div style={{
        height: 280, overflowY: 'auto', padding: '16px 20px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: 8,
          }}>
            <MessageCircle size={28} color="var(--text-3)" />
            <p style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>
              Начните общение
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => {
              const isMe = msg.userId === user?._id;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}
                >
                  <div style={{
                    maxWidth: '70%',
                    background: isMe ? 'var(--accent)' : 'var(--surface-2)',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '8px 12px',
                    boxShadow: isMe ? '0 0 12px var(--accent-glow)' : 'none',
                  }}>
                    <p style={{ fontSize: '0.875rem', color: isMe ? '#fff' : 'var(--text-1)', lineHeight: 1.5 }}>
                      {msg.text}
                    </p>
                    <p style={{ fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-3)', marginTop: 3 }}>
                      {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: '12px 16px', borderTop: '1px solid var(--border)',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <input
          placeholder="Сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          disabled={!connected}
          style={{
            flex: 1, background: 'var(--surface-2)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-m)',
            padding: '9px 14px', color: 'var(--text-1)', fontSize: '0.875rem',
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim() || !connected}
          style={{
            width: 38, height: 38, borderRadius: 'var(--radius-m)',
            background: input.trim() && connected ? 'var(--accent)' : 'var(--surface-2)',
            color: input.trim() && connected ? '#fff' : 'var(--text-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() && connected ? 'pointer' : 'not-allowed',
            boxShadow: input.trim() && connected ? 'var(--shadow-glow)' : 'none',
            border: 'none', transition: 'var(--transition)',
          }}>
          <Send size={16} />
        </motion.button>
      </div>
    </Card>
  );
}