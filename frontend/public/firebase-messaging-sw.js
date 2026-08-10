importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDVYHPVsqpZvy0pEpkzBT5rXKV52DEQJ60",
  authDomain: "fidelitewalletperso.firebaseapp.com",
  projectId: "fidelitewalletperso",
  storageBucket: "fidelitewalletperso.firebasestorage.app",
  messagingSenderId: "478697444894",
  appId: "1:478697444894:web:a9b6fe0d59ffd4190f000f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Message reçu en arrière-plan:', payload);
  
  const title = payload.notification?.title || 'E-Wallet';
  const body = payload.notification?.body || '';
  
  self.registration.showNotification(title, {
    body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: payload.data || {}
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://fidelisation-platform.vercel.app/profil')
  );
});