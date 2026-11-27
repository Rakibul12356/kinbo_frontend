import apiClient from "@/lib/axios";
import type { ApiResponse, NotificationItem } from "@/types/ecommerce";

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const response = await apiClient.get<ApiResponse<NotificationItem[]>>(
      "/notifications"
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${encodeURIComponent(id)}/read`);
  },
};
