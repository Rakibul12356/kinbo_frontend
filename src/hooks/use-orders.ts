"use client";

import { useEffect, useState } from "react";
import {
  ensureDemoOrders,
  listAdminNotifications,
  listOrders,
  subscribeOrders,
  type AdminNotification,
  type StoreOrder,
} from "@/lib/orders/order-store";

export function useOrders() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureDemoOrders();
    const sync = () => {
      setOrders(listOrders());
      setNotifications(listAdminNotifications());
      setReady(true);
    };
    sync();
    return subscribeOrders(sync);
  }, []);

  return {
    ready,
    orders,
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
  };
}
