import { useState, useEffect, useRef, useCallback } from 'react';
import useStore from '../store/useStore';

export default function useAccountChat(accountId) {
    const token = useStore((s) => s.token);
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef(null);

    useEffect(() => {
        if (!accountId || !token) return;

        const wsUrl = import.meta.env.VITE_API_URL
            .replace('https://', 'wss://')
            .replace('http://', 'ws://')
            .replace('/api', '');

        const ws = new WebSocket(
            `${wsUrl}?accountId=${accountId}&token=${token}`
        );

        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                if (msg.type === 'message') {
                    setMessages((prev) => [...prev, msg]);
                }
            } catch {}
        };

        wsRef.current = ws;
        return () => ws.close();
    }, [accountId, token]);

    const send = useCallback((text) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ text }));
        }
    }, []);

    return { messages, connected, send };
}