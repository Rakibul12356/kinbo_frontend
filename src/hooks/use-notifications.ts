"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { notificationService } from "@/services/notification.service";

export const NOTIFICATION_QUERY_KEY = ["notifications"] as const;

export function useNotifications() {
  const { ready, profile } = useAuth();
  const query = useQuery({
    queryKey: NOTIFICATION_QUERY_KEY,
    queryFn: () => notificationService.getNotifications(),
    enabled: ready && Boolean(profile),
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    ...query,
    notifications,
    unreadCount,
  };
}
