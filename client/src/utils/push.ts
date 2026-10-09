import { getVapidKeyApi, subscribePushApi, unsubscribePushApi } from '../api/endpoints';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = window.atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function subscribeToPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  if (Notification.permission === 'denied') return false;

  try {
    if ((await Notification.requestPermission()) !== 'granted') return false;

    const reg = await navigator.serviceWorker.ready;
    const { data } = await getVapidKeyApi();

    const existing = await reg.pushManager.getSubscription();
    const sub = existing ?? (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    }));

    await subscribePushApi(sub.toJSON() as PushSubscriptionJSON);
    return true;
  } catch {
    return false;
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await unsubscribePushApi(sub.endpoint);
      await sub.unsubscribe();
    }
  } catch {
    //
  }
}