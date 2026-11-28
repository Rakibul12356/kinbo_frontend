import apiClient from "@/lib/axios";
import type {
  AdminReturnRequest,
  ApiResponse,
  OrderStatus,
  ReturnRequestStatus,
  ReturnRequestSummary,
} from "@/types/ecommerce";

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mapReturnRequest(raw: unknown): AdminReturnRequest {
  const r = asRecord(raw);
  const user = asRecord(r.user);
  const order = asRecord(r.order);
  const items = Array.isArray(order.items) ? order.items : [];

  return {
    id: String(r.id ?? ""),
    orderId: String(r.orderId ?? r.order_id ?? order.id ?? ""),
    userId: String(r.userId ?? r.user_id ?? user.id ?? ""),
    reason: String(r.reason ?? ""),
    status: String(r.status ?? "PENDING") as ReturnRequestStatus,
    adminNote: (r.adminNote ?? r.admin_note ?? null) as string | null,
    refundAmount:
      r.refundAmount != null || r.refund_amount != null
        ? num(r.refundAmount ?? r.refund_amount)
        : null,
    createdAt: String(r.createdAt ?? r.created_at ?? ""),
    updatedAt: String(r.updatedAt ?? r.updated_at ?? ""),
    user: user.id
      ? {
          id: String(user.id),
          name: String(user.name ?? ""),
          email: String(user.email ?? ""),
          phone: (user.phone as string | null | undefined) ?? null,
        }
      : undefined,
    order: order.id || order.orderNumber
      ? {
          id: String(order.id ?? ""),
          orderNumber: String(order.orderNumber ?? order.order_number ?? ""),
          finalOrderAmount: num(
            order.finalOrderAmount ?? order.final_order_amount
          ),
          status: String(order.status ?? "DELIVERED") as OrderStatus,
          deliveredAt: (order.deliveredAt ?? order.delivered_at ?? null) as
            | string
            | null,
          items: items.map((item) => {
            const i = asRecord(item);
            return {
              id: String(i.id ?? ""),
              productId: i.productId ? String(i.productId) : undefined,
              productName: String(i.productName ?? i.product_name ?? "Item"),
              quantity: num(i.quantity, 1),
              unitPrice: num(i.unitPrice ?? i.unit_price),
            };
          }),
        }
      : undefined,
  };
}

export const returnsService = {
  async getAdminReturns(params?: {
    status?: ReturnRequestStatus | "all";
    page?: number;
    limit?: number;
  }): Promise<{
    returns: AdminReturnRequest[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 15,
    };
    if (params?.status && params.status !== "all") {
      query.status = params.status;
    }

    const response = await apiClient.get<ApiResponse<unknown[]>>("/admin/returns", {
      params: query,
    });
    const list = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta ?? {
      total: list.length,
      page: params?.page ?? 1,
      limit: params?.limit ?? 15,
    };

    return {
      returns: list.map(mapReturnRequest),
      meta: {
        total: num(meta.total, list.length),
        page: num(meta.page, params?.page ?? 1),
        limit: num(meta.limit, params?.limit ?? 15),
        totalPages: num(
          meta.totalPages,
          Math.max(1, Math.ceil(num(meta.total, list.length) / num(meta.limit, 15)))
        ),
      },
    };
  },

  async processReturn(
    id: string,
    payload: {
      status: "APPROVED" | "REJECTED";
      adminNote?: string;
      refundAmount?: number;
    }
  ): Promise<{ message: string; data: ReturnRequestSummary }> {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      `/admin/returns/${encodeURIComponent(id)}`,
      payload
    );
    const mapped = mapReturnRequest(response.data.data);
    return {
      message:
        response.data.message ||
        (payload.status === "APPROVED"
          ? "Return request approved"
          : "Return request rejected"),
      data: mapped,
    };
  },
};
