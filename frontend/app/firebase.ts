import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, type MessagePayload, type Unsubscribe } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDVYHPVsqpZvy0pEpkzBT5rXKV52DEQJ60",
  authDomain: "fidelitewalletperso.firebaseapp.com",
  projectId: "fidelitewalletperso",
  storageBucket: "fidelitewalletperso.firebasestorage.app",
  messagingSenderId: "478697444894",
  appId: "1:478697444894:web:a9b6fe0d59ffd4190f000f"
};

const VAPID_KEY = "BEQveFcm4rlSBcvN7R9nZNZnBFaQzr94TVYext8pI8zElJYd9zWbP1BpJa1aBGPFYvpN7q4r7UdXnzGLynhoLS8";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!('Notification' in window)) return null;

    const permission = Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('❌ Permission refusée');
      return null;
    }

    const supported = await isSupported();
    if (!supported) {
      console.log('ℹ️ Firebase Messaging non supporté');
      return null;
    }

    const messaging = getMessaging(app);

    // Enregistrer le service worker manuellement
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      { scope: '/' }
    );
    console.log('✅ Service Worker enregistré');

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('✅ Token FCM obtenu:', token.substring(0, 20) + '...');
      return token;
    }

    return null;
  } catch (err) {
    console.error('❌ Erreur Firebase:', err);
    return null;
  }
};

export const listenForForegroundNotifications = async (
  callback: (payload: MessagePayload) => void
): Promise<Unsubscribe | null> => {
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  return onMessage(getMessaging(app), callback);
};