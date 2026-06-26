self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();

  self.clients.matchAll({ type: 'window' }).then((clientList) => {
    clientList.forEach((client) => 
    client.postMessage({ type: 'PUSH_RECEIVED', notification: data })
  );
  });

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/pwa-192.png',
      badge: '/pwa-192.png',
      data: { url: data.url || '/' },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url) return;
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const url = event.notification.data?.url || '/';
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});