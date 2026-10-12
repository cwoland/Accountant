import { useCallback, useEffect, useRef, useState } from 'react';
import type { MessageDto } from '@accountant/shared';
import { getMessagesApi, sendMessageApi } from '../api/endpoints';

const POLL_ACTIVE = 8_000;
const POLL_IDLE = 60_000;

export function useAccountChat(accountId: string | null) {
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchAll = useCallback(async () => {
    if (!accountId) return;
    try {
      const { data } = await getMessagesApi(accountId, { limit: 50 });
      setMessages(data.items);
    } catch {

    }
  }, [accountId]);

  useEffect(() => {
    if (!accountId) { setMessages([]); return; }

    let stopped = false;
    setLoading(true);
    void fetchAll().finally(() => setLoading(false));

    const tick = () => {
      if (stopped) return;
      const delay = document.visibilityState === 'visible' ? POLL_ACTIVE : POLL_IDLE;
      timer.current = setTimeout(() => {
        if (document.visibilityState === 'visible') void fetchAll();
        tick();
      }, delay);
    };
    tick();

    const onVisible = () => { if (document.visibilityState === 'visible') void fetchAll(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      stopped = true;
      clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [accountId, fetchAll]);

  const send = useCallback(async (text: string) => {
    if (!accountId || !text.trim()) return;
    setSending(true);
    try {
      const { data } = await sendMessageApi(accountId, text.trim());
      setMessages((prev) => [...prev, data]);
    } finally {
      setSending(false);
    }
  }, [accountId]);

  return { messages, loading, sending, send };
}