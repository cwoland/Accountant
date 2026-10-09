import { useEffect, useState } from 'react';

/**
 * navigator.onLine врёт в одну сторону: true означает «есть сетевой
 * интерфейс», а не «сервер отвечает». Для офлайн-очереди этого достаточно —
 * неудачная отправка всё равно вернёт запись в очередь.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return online;
}
