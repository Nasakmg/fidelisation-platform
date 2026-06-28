importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

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
  console.log('📩 Message reçu en arrière-plan:', payload);
  
  const { title, body } = payload.notification;
  
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: payload.data,
  });
});