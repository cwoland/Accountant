import { useEffect } from 'react';
import useNotificationStore from '../store/useNotificationStore';

export default function usePushListener() {
    const addNotification = useNotificationStore((s) => s.addNotification);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const handler = (event) => {
            if (event.data?.type === 'PUSH_RECEIVED') {
                addNotification({
                    title: event.data.notification.title,
                    body: event.data.notification.body,
                    url: event.data.notification.url || '/',
                    icon: '🔔',
                });
            }
        };

        navigator.serviceWorker.addEventListener('message', handler);
        return () => navigator.serviceWorker.removeEventListener('message', handler);
    }, [addNotification]);
}