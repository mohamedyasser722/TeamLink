'use client';

import React, { useEffect, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

const ToastNotification: React.FC = () => {
  const { notifications } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Show the latest notification as a toast
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Only show if it's not already visible
      if (!visibleNotifications.includes(latestNotification.id)) {
        setVisibleNotifications(prev => [...prev, latestNotification.id]);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          setVisibleNotifications(prev => prev.filter(id => id !== latestNotification.id));
        }, 5000);
      }
    }
  }, [notifications, visibleNotifications]);

  const handleClose = (notificationId: string) => {
    setVisibleNotifications(prev => prev.filter(id => id !== notificationId));
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'application_received':
        return '🎯';
      case 'application_accepted':
        return '🎉';
      case 'application_rejected':
        return '📋';
      default:
        return '🔔';
    }
  };

  const getToastColor = (type: string) => {
    switch (type) {
      case 'application_received':
        return 'bg-blue-500';
      case 'application_accepted':
        return 'bg-green-500';
      case 'application_rejected':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications
        .filter(notification => visibleNotifications.includes(notification.id))
        .map(notification => (
          <div
            key={notification.id}
            className={`${getToastColor(notification.type)} text-white px-6 py-4 rounded-lg shadow-lg max-w-sm transform transition-transform duration-300 ease-in-out`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 text-lg">
                {getToastIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{notification.title}</p>
                <p className="text-sm opacity-90 mt-1">{notification.message}</p>
              </div>
              <button
                onClick={() => handleClose(notification.id)}
                className="flex-shrink-0 text-white hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))
      }
    </div>
  );
};

export default ToastNotification; 