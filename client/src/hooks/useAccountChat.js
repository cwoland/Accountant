import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

export default function useAccountChat(accountId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const lastIdRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!accountId) return;
    try {
      const { data } = await api.get(`/messages/${accountId}`);
      setMessages(data);
      if (data.length > 0) lastIdRef.current = data[data.length - 1]._id;
    } catch {}
  }, [accountId]);

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    fetchMessages().finally(() => setLoading(false));

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [accountId, fetchMessages]);

  const send = useCallback(async (text) => {
    if (!text?.trim() || !accountId) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/${accountId}`, { text });
      setMessages((prev) => [...prev, data]);
    } catch {} finally {
      setSending(false);
    }
  }, [accountId]);

  return { messages, loading, sending, send };
}