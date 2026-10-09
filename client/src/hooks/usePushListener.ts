import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toIconName } from '@accountant/shared';
import { useNotificationStore } from '../store/notificationStore';

interface PushMessage {
  type: 'PUSH_RECEIVED' | 'NAVIGATE';
  notification?: { title: string; body?: string; url?: string; icon?: string };
  url?: string;
}

export function usePushListener(): void {
  const add = useNotificationStore((s) => s.add);
  const navigate = useNavigate();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event: MessageEvent<PushMessage>) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'PUSH_RECEIVED' && data.notification) {
        add({
          title: data.notification.title,
          body: data.notification.body ?? '',
          url: data.notification.url ?? '/',
          icon: toIconName(data.notification.icon),
        });
        return;
      }

      // Клик по системному уведомлению: раньше SW делал client.navigate(),
      // что перезагружало SPA целиком. Теперь роутер переходит без перезагрузки.
      if (data.type === 'NAVIGATE' && data.url) navigate(data.url);
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [add, navigate]);
}
