import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDVYHPVsqpZvy0pEpkzBT5rXKV52DEQJ60",
  authDomain: "fidelitewalletperso.firebaseapp.com",
  projectId: "fidelitewalletperso",
  storageBucket: "fidelitewalletperso.firebasestorage.app",
  messagingSenderId: "478697444894",
  appId: "1:478697444894:web:a9b6fe0d59ffd4190f000f"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY = "BEQveFcm4rlSBcvN7R9nZNZnBFaQzr94TVYext8pI8zElJYd9zWbP1BpJa1aBGPFYvpN7q4r7UdXnzGLynhoLS8";

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log('✅ Token FCM:', token);
      return token;
    }
    return null;
  } catch (err) {
    console.error('❌ Erreur Firebase:', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };