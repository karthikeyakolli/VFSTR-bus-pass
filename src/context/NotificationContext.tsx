import React, { createContext, useState, useCallback } from 'react';
import { NotificationItem } from '@/types';

export interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'read' | 'time'>) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Bus Pass Approved',
    message: 'Your annual bus pass for Route #14 has been approved by the Transport Cell.',
    time: '10 mins ago',
    read: false,
    type: 'pass',
  },
  {
    id: '2',
    title: 'Route Schedule Update',
    message: 'Morning pickup time for Guntur City Route #8 moved 5 mins earlier.',
    time: '1 hour ago',
    read: false,
    type: 'route',
  },
  {
    id: '3',
    title: 'Fee Payment Verified',
    message: 'Online transaction ₹18,500 successfully verified.',
    time: 'Yesterday',
    read: true,
    type: 'pass',
  },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const addNotification = useCallback((item: Omit<NotificationItem, 'id' | 'read' | 'time'>) => {
    const newItem: NotificationItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      read: false,
      time: 'Just now',
    };
    setNotifications((prev) => [newItem, ...prev]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        markAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
