import api from '../api/axios';

export const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('pushManager' in window)) {
        console.log('Push not available');
        return false;
    }

    try {
        const { data } = await api.get('/push/vapid-key');
        const reg = await navigator.serviceWorker.ready;

        const existing = await reg.pushManager.getSubscription();
        if (existing) await existing.unsubscribe();

        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUnit8Array(data.publicKey),
        });

        await api.post('/push/subscribe', { subscription });
        return true;
    } catch (err) {
        console.error('Push subscribe error:', err);
        return false;
    }
};

export const unsubscribeFromPush = async () => {
    try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
        await api.delete('/push/subscribe');
    } catch (err) {
        console.error('Push unsubscribe error:', err);
    }
};

function urlBase64ToUnit8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}