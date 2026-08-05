"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { generateOrderId, timeAgo } from "@/lib/utils";

export interface AdminNotification {
  id: string;
  type: "new_order";
  userName: string;
  userAvatar: string;
  orderId: string;
  amount: number;
  itemCount: number;
  paymentMethod: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextValue {
  notifications: AdminNotification[];
  unreadCount: number;
  addOrderNotification: (params: {
    userName: string;
    userAvatar: string;
    amount: number;
    itemCount: number;
    paymentMethod: string;
  }) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getTimeAgo: (date: Date) => string;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

// Pre-seed with a couple of example notifications so admin panel looks populated
const seedNotifications: AdminNotification[] = [
  {
    id: "seed-1",
    type: "new_order",
    userName: "Priya Sharma",
    userAvatar: "PS",
    orderId: "GM20240001",
    amount: 789,
    itemCount: 5,
    paymentMethod: "UPI",
    timestamp: new Date(Date.now() - 1000 * 60 * 35),
    read: true,
  },
  {
    id: "seed-2",
    type: "new_order",
    userName: "Rajesh Kumar",
    userAvatar: "RK",
    orderId: "GM20240002",
    amount: 1245,
    itemCount: 8,
    paymentMethod: "Card",
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    read: false,
  },
  {
    id: "seed-3",
    type: "new_order",
    userName: "Anitha Reddy",
    userAvatar: "AR",
    orderId: "GM20240003",
    amount: 340,
    itemCount: 3,
    paymentMethod: "COD",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] =
    useState<AdminNotification[]>(seedNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addOrderNotification = useCallback(
    (params: {
      userName: string;
      userAvatar: string;
      amount: number;
      itemCount: number;
      paymentMethod: string;
    }): string => {
      const orderId = generateOrderId();
      const notification: AdminNotification = {
        id: `notif-${Date.now()}`,
        type: "new_order",
        ...params,
        orderId,
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
      return orderId;
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addOrderNotification,
        markAsRead,
        markAllAsRead,
        getTimeAgo: timeAgo,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  return ctx;
}
