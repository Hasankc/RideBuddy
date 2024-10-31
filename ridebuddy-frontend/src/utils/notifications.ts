import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const initializeNotifications = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_VAPID_KEY
    });

    // Send token to backend
    await fetch('/api/notifications/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    // Handle foreground messages
    onMessage(messaging, (payload) => {
      const { title, body, image } = payload.notification;
      
      new Notification(title, {
        body,
        icon: image,
        badge: '/notification-badge.png',
        tag: payload.data.type
      });
    });

  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
};

export const sendNotification = async (userId: string, notification: {
  title: string;
  body: string;
  image?: string;
  data?: Record<string, string>;
}) => {
  try {
    await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        notification
      })
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};