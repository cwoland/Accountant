import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useAccountChat } from '../hooks/useAccountChat';
import { useAuthStore } from '../store/authStore';
import styles from './AccountChat.module.css';

export default function AccountChat({ accountId, accountName }: { accountId: string; accountName: string }) {
  const me = useAuthStore((s) => s.user);
  const { messages, loading, sending, send } = useAccountChat(accountId);
  const [text, setText] = useState('');
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setText('');
    await send(value);
  };

  return (
    <div className={styles.chat}>
      <header className={styles.head}>
        <MessageCircle size={15} aria-hidden />
        <span>Чат · {accountName}</span>
      </header>

      <div className={styles.log} role="log" aria-live="polite" aria-label={`Чат счёта ${accountName}`}>
        {loading && messages.length === 0 && <p className={styles.hint}>Загружаем переписку…</p>}
        {!loading && messages.length === 0 && <p className={styles.hint}>Сообщений пока нет. Напишите первым.</p>}

        {messages.map((m) => {
          const mine = m.user._id === me?._id;
          return (
            <div key={m._id} className={styles.row} data-mine={mine || undefined}>
              {!mine && <span className={styles.author}>{m.user.name}</span>}
              <div className={styles.bubble}>{m.text}</div>
              <time className={styles.time} dateTime={m.createdAt}>
                {new Date(m.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      <form className={styles.compose} onSubmit={submit}>
        <textarea
          className={styles.input}
          rows={1}
          placeholder="Написать сообщение"
          aria-label="Текст сообщения"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submit(e); } }}
        />
        <button type="submit" className={styles.send} disabled={!text.trim() || sending} aria-label="Отправить">
          <Send size={16} aria-hidden />
        </button>
      </form>
    </div>
  );
}