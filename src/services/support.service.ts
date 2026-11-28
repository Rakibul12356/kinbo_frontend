import apiClient from "@/lib/axios";
import type {
  ApiResponse,
  SupportTicketItem,
  SupportTicketPayload,
} from "@/types/ecommerce";

export const supportService = {
  async submitTicket(
    payload: SupportTicketPayload
  ): Promise<{ ticketNumber: string; status: string; message?: string }> {
    const response = await apiClient.post<
      ApiResponse<{ ticketNumber: string; status: string }>
    >("/support", payload);
    return {
      ticketNumber: response.data.data.ticketNumber,
      status: response.data.data.status,
      message: response.data.message,
    };
  },

  async getAdminTickets(): Promise<SupportTicketItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<SupportTicketItem[]>>(
        "/admin/support"
      );
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch {
      return [];
    }
  },

  async issueRefund(
    ticketId: string,
    payload: { refundAmount: number; adminRemarks: string }
  ): Promise<string> {
    const response = await apiClient.post<ApiResponse<null>>(
      `/admin/support/${encodeURIComponent(ticketId)}/refund`,
      payload
    );
    return response.data.message || "Refund recorded successfully";
  },
};
