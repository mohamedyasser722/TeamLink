'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

export interface NotificationData {
  id: string;
  type: 'application_received' | 'application_accepted' | 'application_rejected';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io('http://localhost:3000', {
        withCredentials: true,
      });

      setSocket(newSocket);

      // Handle connection events
      newSocket.on('connect', () => {
        console.log('Connected to notification server');
        setIsConnected(true);
        
        // Join user's notification room
        newSocket.emit('join-notifications', { userId: user.id });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from notification server');
        setIsConnected(false);
      });

      newSocket.on('notifications-joined', (data) => {
        console.log('Joined notifications successfully:', data);
      });

      // Handle incoming notifications
      newSocket.on('notification', (notification: NotificationData) => {
        console.log('Received notification:', notification);
        
        // Parse timestamp if it's a string
        const parsedNotification = {
          ...notification,
          timestamp: new Date(notification.timestamp),
        };
        
        setNotifications(prev => [parsedNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if supported
        if (Notification.permission === 'granted') {
          new Notification(parsedNotification.title, {
            body: parsedNotification.message,
            icon: '/favicon.ico',
          });
        }
      });

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = (notificationId: string) => {
    setReadNotifications(prev => new Set(prev).add(notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(new Set(allIds));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setReadNotifications(new Set());
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 