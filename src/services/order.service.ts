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
  addressId?: string;
  customerName: string;
  phone: string;
  streetAddress: string;
  city: string;
  deliveryArea: DeliveryArea;
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

function normalizeOrderDetail(raw: unknown): OrderDetail {
  const record = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const nestedShipping =
    (record.shippingAddress && typeof record.shippingAddress === "object"
      ? (record.shippingAddress as Record<string, unknown>)
      : null) ??
    (record.address && typeof record.address === "object"
      ? (record.address as Record<string, unknown>)
      : null);
  const nestedUser =
    record.user && typeof record.user === "object"
      ? (record.user as Record<string, unknown>)
      : null;

  const shippingAddress = {
    customerName: String(
      nestedShipping?.customerName ??
        record.customerName ??
        nestedUser?.name ??
        ""
    ),
    phone: String(
      nestedShipping?.phone ?? record.phone ?? nestedUser?.phone ?? ""
    ),
    streetAddress: String(
      nestedShipping?.streetAddress ?? record.streetAddress ?? ""
    ),
    city: String(nestedShipping?.city ?? record.city ?? ""),
    deliveryArea:
      ((nestedShipping?.deliveryArea ?? record.deliveryArea) as DeliveryArea) ||
      "INSIDE_DHAKA",
  };

  const rawItems = Array.isArray(record.items)
    ? record.items
    : Array.isArray(record.orderItems)
      ? record.orderItems
      : [];

  const items = rawItems.map((entry, idx) => {
    const itemRecord = (entry && typeof entry === "object" ? entry : {}) as Record<
      string,
      unknown
    >;
    const nestedProduct =
      itemRecord.product && typeof itemRecord.product === "object"
        ? (itemRecord.product as { name?: string; images?: string[] })
        : undefined;
    const rawImage =
      itemRecord.productImage ??
      itemRecord.image ??
      itemRecord.thumbnail ??
      (Array.isArray(nestedProduct?.images) ? nestedProduct.images[0] : undefined);
    const quantity = Number(itemRecord.quantity ?? 1);
    const unitPrice = Number(itemRecord.unitPrice ?? itemRecord.price ?? 0);
    const finalUnitPrice = Number(
      itemRecord.finalUnitPrice ?? itemRecord.unitPrice ?? itemRecord.price ?? 0
    );
    return {
      id: String(itemRecord.id ?? itemRecord.productId ?? `item-${idx}`),
      productId:
        typeof itemRecord.productId === "string" ? itemRecord.productId : undefined,
      productName:
        (typeof itemRecord.productName === "string" && itemRecord.productName) ||
        nestedProduct?.name ||
        "Product",
      productImage: rawImage ? resolveAssetUrl(rawImage) : undefined,
      quantity,
      unitPrice,
      discountPercent: Number(itemRecord.discountPercent ?? 0),
      finalUnitPrice,
      totalPrice: Number(itemRecord.totalPrice ?? finalUnitPrice * quantity),
    };
  });

  const rawHistory = Array.isArray(record.statusHistory)
    ? record.statusHistory
    : Array.isArray(record.history)
      ? record.history
      : [];

  return {
    id: String(record.id ?? record.orderId ?? ""),
    orderNumber: String(record.orderNumber ?? record.id ?? record.orderId ?? ""),
    status: (record.status as OrderStatus) || "PENDING",
    paymentMethod: String(record.paymentMethod ?? "COD"),
    paymentStatus: String(record.paymentStatus ?? "UNPAID"),
    totalProductPrice:
      record.totalProductPrice != null ? Number(record.totalProductPrice) : undefined,
    discountAmount:
      record.discountAmount != null ? Number(record.discountAmount) : undefined,
    regularDeliveryCharge:
      record.regularDeliveryCharge != null
        ? Number(record.regularDeliveryCharge)
        : undefined,
    deliveryDiscount:
      record.deliveryDiscount != null ? Number(record.deliveryDiscount) : undefined,
    finalDeliveryCharge:
      record.finalDeliveryCharge != null ? Number(record.finalDeliveryCharge) : undefined,
    isFirstOrderFreeDelivery:
      typeof record.isFirstOrderFreeDelivery === "boolean"
        ? record.isFirstOrderFreeDelivery
        : undefined,
    finalOrderAmount: Number(
      record.finalOrderAmount ?? record.totalAmount ?? record.total ?? 0
    ),
    shippingAddress,
    items,
    statusHistory: rawHistory as OrderDetail["statusHistory"],
    createdAt:
      typeof record.createdAt === "string" ? record.createdAt : undefined,
    deliveredAt:
      typeof record.deliveredAt === "string"
        ? record.deliveredAt
        : record.deliveredAt === null
          ? null
          : undefined,
    returnRequest:
      record.returnRequest && typeof record.returnRequest === "object"
        ? (() => {
            const rr = record.returnRequest as Record<string, unknown>;
            return {
              id: String(rr.id ?? ""),
              orderId: String(rr.orderId ?? record.id ?? ""),
              userId: String(rr.userId ?? ""),
              reason: String(rr.reason ?? ""),
              status: String(rr.status ?? "PENDING") as NonNullable<
                OrderDetail["returnRequest"]
              >["status"],
              adminNote: (rr.adminNote as string | null | undefined) ?? null,
              refundAmount:
                rr.refundAmount != null ? Number(rr.refundAmount) : null,
              createdAt: String(rr.createdAt ?? ""),
              updatedAt: String(rr.updatedAt ?? ""),
            };
          })()
        : null,
  };
}

function unwrapOrderPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as Record<string, unknown>;

  if ("data" in body) {
    const rawData = body.data;
    if (!rawData) return null;
    if (Array.isArray(rawData)) {
      return rawData[0] ?? null;
    }
    if (typeof rawData === "object") {
      const dataObj = rawData as Record<string, unknown>;
      if (dataObj.order && typeof dataObj.order === "object") {
        return { ...dataObj, ...(dataObj.order as Record<string, unknown>) };
      }
      return Object.keys(dataObj).length > 0 ? dataObj : null;
    }
    return null;
  }

  if (body.order && typeof body.order === "object") {
    return { ...body, ...(body.order as Record<string, unknown>) };
  }
  if ("id" in body || "orderId" in body || "orderNumber" in body || "status" in body) {
    return body;
  }
  return null;
}

async function fetchOrderDetailWithFallback(
  endpoint: string,
  fallbackList: () => Promise<OrderSummary[]>,
  id: string
): Promise<OrderDetail> {
  let originalError: unknown = null;
  try {
    const response = await apiClient.get<ApiResponse<OrderDetail>>(endpoint);
    const unwrapped = unwrapOrderPayload(response.data);
    if (unwrapped) {
      return normalizeOrderDetail(unwrapped);
    }
  } catch (error) {
    originalError = error;
  }

  const orders = await fallbackList().catch(() => [] as OrderSummary[]);
  const matched = orders.find((o) => o.id === id || o.orderNumber === id);
  if (matched) {
    return normalizeOrderDetail(matched);
  }
  if (originalError) {
    throw originalError;
  }
  throw new Error("Order details not found.");
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
    return fetchOrderDetailWithFallback(
      `/orders/${encodeURIComponent(id)}`,
      () => this.getMyOrders(),
      id
    );
  },

  async getAdminOrderById(id: string): Promise<OrderDetail> {
    return fetchOrderDetailWithFallback(
      `/admin/orders/${encodeURIComponent(id)}`,
      () => this.getAdminOrders(),
      id
    );
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
