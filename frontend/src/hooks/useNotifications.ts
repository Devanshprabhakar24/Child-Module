import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

interface Notification {
  type: 'vaccination_due' | 'health_record' | 'milestone' | 'go_green' | 'payment' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

export function useNotifications(userId?: string, registrationId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId || !registrationId) return;

    // Create socket connection
    const newSocket = io(`${API_BASE}/notifications`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to notification server');
      setConnected(true);
      
      // Register user for notifications
      newSocket.emit('register', { userId, registrationId });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from notification server');
      setConnected(false);
    });

    newSocket.on('notification', (notification: Notification) => {
      console.log('📬 New notification:', notification);
      
      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          badge: '/logo.png',
        });
      }
      
      // Play notification sound (optional)
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        // Ignore if audio fails to play
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, registrationId]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((index: number) => {
    setNotifications((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    clearAll,
    requestNotificationPermission,
  };
}
