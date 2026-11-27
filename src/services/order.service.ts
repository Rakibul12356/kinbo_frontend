import apiClient, { resolveAssetUrl } from "@/lib/axios";
import type {
  ApiResponse,
  CheckoutSummary,
  DeliveryArea,
  OrderDetail,
  OrderStatus,
  OrderSummary,
} from "@/types/ecommerce";

export interface CheckoutSummaryPayload {
  deliveryArea: DeliveryArea;
  items: Array<{ productId: string; quantity: number }>;
}

export interface PlaceOrderPayload {
  deliveryArea: DeliveryArea;
  shippingAddress: {
    customerName: string;
    phone: string;
    streetAddress: string;
    city: string;
    deliveryArea: DeliveryArea;
  };
  items: Array<{ productId: string; quantity: number }>;
}

export interface PlacedOrderResult {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  totalProductPrice: number;
  discountAmount: number;
  regularDeliveryCharge: number;
  deliveryDiscount: number;
  finalDeliveryCharge: number;
  isFirstOrderFreeDelivery: boolean;
  finalOrderAmount: number;
  createdAt: string;
}

export const orderService = {
  async calculateSummary(
    payload: CheckoutSummaryPayload
  ): Promise<CheckoutSummary> {
    const response = await apiClient.post<ApiResponse<CheckoutSummary>>(
      "/checkout/calculate-summary",
      payload
    );
    return response.data.data;
  },

  async placeOrder(payload: PlaceOrderPayload): Promise<PlacedOrderResult> {
    const response = await apiClient.post<ApiResponse<PlacedOrderResult>>(
      "/orders",
      payload
    );
    return response.data.data;
  },

  async getMyOrders(): Promise<OrderSummary[]> {
    const response = await apiClient.get<ApiResponse<OrderSummary[]>>(
      "/orders/my-orders"
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async getOrderById(id: string): Promise<OrderDetail> {
    const response = await apiClient.get<ApiResponse<OrderDetail>>(
      `/orders/${encodeURIComponent(id)}`
    );
    const data = response.data.data;
    return {
      ...data,
      items: (data.items || []).map((item) => ({
        ...item,
        productImage: item.productImage ? resolveAssetUrl(item.productImage) : undefined,
      })),
    };
  },

  async cancelOrder(id: string, reason: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<null>>(
      `/orders/${encodeURIComponent(id)}/cancel`,
      { reason }
    );
    return response.data.message || "Order cancelled successfully";
  },

  async returnOrder(id: string, reason: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<null>>(
      `/orders/${encodeURIComponent(id)}/return`,
      { reason }
    );
    return (
      response.data.message ||
      "Return request submitted. Admin will review your request shortly."
    );
  },

  async advanceOrderStatus(
    id: string,
    payload: { status: OrderStatus; note?: string }
  ): Promise<string> {
    const response = await apiClient.patch<ApiResponse<null>>(
      `/admin/orders/${encodeURIComponent(id)}/status`,
      payload
    );
    return response.data.message || `Order status updated to ${payload.status}`;
  },

  async getAdminOrders(): Promise<OrderSummary[]> {
    try {
      const response = await apiClient.get<ApiResponse<OrderSummary[]>>("/admin/orders");
      if (Array.isArray(response.data.data)) return response.data.data;
    } catch {
      // Fallback to overview recentOrders + recentReturnRequests if dedicated list route is absent
    }
    const overview = await apiClient.get<
      ApiResponse<{ recentOrders?: OrderSummary[]; recentReturnRequests?: OrderSummary[] }>
    >("/admin/analytics/overview");
    const recent = overview.data.data?.recentOrders ?? [];
    const returns = overview.data.data?.recentReturnRequests ?? [];
    const map = new Map<string, OrderSummary>();
    for (const o of [...recent, ...returns]) {
      map.set(o.id, o);
    }
    return [...map.values()];
  },
};
