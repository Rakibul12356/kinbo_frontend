import apiClient, { resolveAssetUrl } from "@/lib/axios";
import type {
  AdminAnalyticsOverview,
  AdminAnalyticsReports,
  AdminChartPoint,
  AdminCustomer,
  AdminCustomerDossier,
  ApiResponse,
  OrderStatus,
  OrderSummary,
} from "@/types/ecommerce";

export type ChartFilter = "7d" | "1m" | "3m" | "6m" | "12m";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function firstNum(source: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
      return num(source[key]);
    }
  }
  return 0;
}

function mapOrderSummary(raw: unknown): OrderSummary | null {
  const o = asRecord(raw);
  if (!o.id && !o.orderNumber && !o.order_number) return null;
  const shipping = asRecord(o.shippingAddress ?? o.shipping_address);
  return {
    id: String(o.id ?? o.orderId ?? o.order_id ?? ""),
    orderNumber: String(o.orderNumber ?? o.order_number ?? o.id ?? ""),
    status: String(o.status ?? "PENDING") as OrderStatus,
    paymentMethod: String(o.paymentMethod ?? o.payment_method ?? "COD"),
    paymentStatus: String(o.paymentStatus ?? o.payment_status ?? "UNPAID"),
    finalOrderAmount: num(
      o.finalOrderAmount ?? o.final_order_amount ?? o.total ?? o.amount,
      0
    ),
    customerName:
      (o.customerName as string | undefined) ??
      (o.customer_name as string | undefined) ??
      (shipping.customerName as string | undefined) ??
      (shipping.customer_name as string | undefined) ??
      undefined,
    createdAt: String(o.createdAt ?? o.created_at ?? ""),
  } as OrderSummary;
}

function mapOrders(raw: unknown): OrderSummary[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapOrderSummary).filter((o): o is OrderSummary => Boolean(o?.id));
}

function pickKpis(rawData: Record<string, unknown>): AdminAnalyticsOverview["kpis"] {
  const kpis = asRecord(
    rawData.kpis ?? rawData.KPI ?? rawData.metrics ?? rawData.stats ?? rawData
  );

  return {
    totalDeliveredSales: firstNum(kpis, [
      "totalDeliveredSales",
      "total_delivered_sales",
      "deliveredSales",
      "delivered_sales",
      "totalSales",
      "total_sales",
      "sales",
    ]),
    deliveredOrdersCount: firstNum(kpis, [
      "deliveredOrdersCount",
      "delivered_orders_count",
      "deliveredOrders",
      "delivered_orders",
      "totalDeliveredOrders",
    ]),
    totalNetRevenue: firstNum(kpis, [
      "totalNetRevenue",
      "total_net_revenue",
      "netRevenue",
      "net_revenue",
      "revenue",
      "totalRevenue",
      "total_revenue",
    ]),
    totalCustomers: firstNum(kpis, [
      "totalCustomers",
      "total_customers",
      "customers",
      "customerCount",
      "customer_count",
      "users",
      "totalUsers",
      "total_users",
    ]),
    returnedOrdersCount: firstNum(kpis, [
      "returnedOrdersCount",
      "returned_orders_count",
      "returnedOrders",
      "returned_orders",
      "returns",
      "totalReturns",
    ]),
  };
}

function mapChartPoint(raw: unknown): AdminChartPoint | null {
  const p = asRecord(raw);
  const date = String(p.date ?? p.day ?? p.label ?? p.period ?? "").trim();
  if (!date) return null;
  return {
    date,
    sales: firstNum(p, ["sales", "revenue", "totalSales", "total_sales", "amount"]),
    orders: firstNum(p, ["orders", "orderCount", "order_count", "count", "totalOrders"]),
  };
}

function mapChartPoints(raw: unknown): AdminChartPoint[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(asRecord(raw).points)
      ? (asRecord(raw).points as unknown[])
      : Array.isArray(asRecord(raw).series)
        ? (asRecord(raw).series as unknown[])
        : Array.isArray(asRecord(raw).data)
          ? (asRecord(raw).data as unknown[])
          : [];
  return list.map(mapChartPoint).filter((p): p is AdminChartPoint => Boolean(p));
}

function buildChartFromOrders(
  orders: OrderSummary[],
  filter: ChartFilter
): AdminChartPoint[] {
  const days =
    filter === "7d" ? 7 : filter === "1m" ? 30 : filter === "3m" ? 90 : filter === "6m" ? 180 : 365;
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const buckets = new Map<string, AdminChartPoint>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, sales: 0, orders: 0 });
  }

  for (const order of orders) {
    if (order.status !== "DELIVERED") continue;
    const created = order.createdAt ? new Date(order.createdAt) : null;
    if (!created || Number.isNaN(created.getTime())) continue;
    if (created < start || created > end) continue;
    const key = created.toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.orders += 1;
    bucket.sales += num(order.finalOrderAmount);
  }

  return [...buckets.values()];
}

async function enrichKpis(
  kpis: AdminAnalyticsOverview["kpis"],
  recentOrders: OrderSummary[]
): Promise<AdminAnalyticsOverview["kpis"]> {
  const next = { ...kpis };
  const delivered = recentOrders.filter((o) => o.status === "DELIVERED");
  const returned = recentOrders.filter((o) => o.status === "RETURNED");

  if (next.totalDeliveredSales <= 0 && delivered.length > 0) {
    next.totalDeliveredSales = delivered.reduce((sum, o) => sum + num(o.finalOrderAmount), 0);
  }
  if (next.deliveredOrdersCount <= 0 && delivered.length > 0) {
    next.deliveredOrdersCount = delivered.length;
  }
  if (next.totalNetRevenue <= 0 && next.totalDeliveredSales > 0) {
    next.totalNetRevenue = next.totalDeliveredSales;
  }
  if (next.returnedOrdersCount <= 0 && returned.length > 0) {
    next.returnedOrdersCount = returned.length;
  }

  if (next.totalCustomers <= 0) {
    try {
      const customers = await apiClient.get<ApiResponse<AdminCustomer[]>>("/admin/customers", {
        params: { page: 1, limit: 1 },
      });
      next.totalCustomers = num(
        customers.data.meta?.total ??
          (Array.isArray(customers.data.data) ? customers.data.data.length : 0)
      );
    } catch {
      // keep zero
    }
  }

  // Prefer full reports when KPI counters still look empty.
  if (
    next.deliveredOrdersCount <= 0 ||
    next.totalDeliveredSales <= 0 ||
    next.returnedOrdersCount <= 0
  ) {
    try {
      const reportsRes = await apiClient.get<ApiResponse<AdminAnalyticsReports>>(
        "/admin/analytics/reports"
      );
      const reports = asRecord(reportsRes.data.data);
      const status = asRecord(reports.statusCounts ?? reports.status_counts);
      const deliveredCount = num(status.DELIVERED);
      const returnedCount = num(status.RETURNED);
      if (next.deliveredOrdersCount <= 0 && deliveredCount > 0) {
        next.deliveredOrdersCount = deliveredCount;
      }
      if (next.returnedOrdersCount <= 0 && returnedCount > 0) {
        next.returnedOrdersCount = returnedCount;
      }
      const aov = num(reports.averageOrderValue ?? reports.average_order_value);
      if (next.totalDeliveredSales <= 0 && deliveredCount > 0 && aov > 0) {
        next.totalDeliveredSales = deliveredCount * aov;
      }
      if (next.totalNetRevenue <= 0 && next.totalDeliveredSales > 0) {
        next.totalNetRevenue = next.totalDeliveredSales;
      }
    } catch {
      // keep current
    }
  }

  // Last resort: sum all admin orders if still empty.
  if (next.totalDeliveredSales <= 0 || next.deliveredOrdersCount <= 0) {
    try {
      const ordersRes = await apiClient.get<ApiResponse<OrderSummary[]>>("/admin/orders");
      const orders = mapOrders(ordersRes.data.data);
      const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
      if (next.deliveredOrdersCount <= 0) next.deliveredOrdersCount = deliveredOrders.length;
      if (next.totalDeliveredSales <= 0) {
        next.totalDeliveredSales = deliveredOrders.reduce(
          (sum, o) => sum + num(o.finalOrderAmount),
          0
        );
      }
      if (next.totalNetRevenue <= 0) next.totalNetRevenue = next.totalDeliveredSales;
      if (next.returnedOrdersCount <= 0) {
        next.returnedOrdersCount = orders.filter((o) => o.status === "RETURNED").length;
      }
    } catch {
      // keep current
    }
  }

  return next;
}

export const adminService = {
  async getAnalyticsOverview(): Promise<AdminAnalyticsOverview> {
    const response = await apiClient.get<ApiResponse<unknown>>("/admin/analytics/overview");
    const payload = response.data as unknown;
    const root = asRecord(payload);
    const rawData = asRecord(root.data ?? payload);

    const recentOrders = mapOrders(
      rawData.recentOrders ?? rawData.recent_orders ?? rawData.orders
    );
    const recentReturnRequests = mapOrders(
      rawData.recentReturnRequests ??
        rawData.recent_return_requests ??
        rawData.returnRequests ??
        rawData.returns
    );

    const kpis = await enrichKpis(pickKpis(rawData), [
      ...recentOrders,
      ...recentReturnRequests,
    ]);

    return {
      kpis,
      recentOrders,
      recentReturnRequests,
    };
  },

  async getAnalyticsCharts(filter: ChartFilter = "7d"): Promise<{
    filter: ChartFilter;
    data: AdminChartPoint[];
  }> {
    try {
      const response = await apiClient.get<ApiResponse<unknown> & { filter?: ChartFilter }>(
        "/admin/analytics/charts",
        { params: { filter } }
      );
      const root = asRecord(response.data);
      const points = mapChartPoints(root.data ?? root);
      const hasSignal = points.some((p) => p.sales > 0 || p.orders > 0);
      if (hasSignal) {
        return {
          filter: (root.filter as ChartFilter | undefined) ?? filter,
          data: points,
        };
      }
    } catch {
      // fall through to order-derived chart
    }

    // Backend chart series often empty even when delivered orders exist.
    try {
      const ordersRes = await apiClient.get<ApiResponse<OrderSummary[]>>("/admin/orders");
      const orders = mapOrders(ordersRes.data.data);
      return { filter, data: buildChartFromOrders(orders, filter) };
    } catch {
      return { filter, data: [] };
    }
  },

  async getAnalyticsReports(): Promise<AdminAnalyticsReports> {
    const response = await apiClient.get<ApiResponse<unknown>>("/admin/analytics/reports");
    const raw = asRecord(asRecord(response.data).data ?? response.data);
    const statusCounts = asRecord(raw.statusCounts ?? raw.status_counts) as Record<
      OrderStatus,
      number
    >;
    const topRaw = Array.isArray(raw.topProducts)
      ? raw.topProducts
      : Array.isArray(raw.top_products)
        ? raw.top_products
        : [];

    return {
      statusCounts,
      averageOrderValue: num(raw.averageOrderValue ?? raw.average_order_value),
      cancellationRate: String(raw.cancellationRate ?? raw.cancellation_rate ?? "0%"),
      returnRate: String(raw.returnRate ?? raw.return_rate ?? "0%"),
      topProducts: topRaw.map((item) => {
        const p = asRecord(item);
        return {
          productId: String(p.productId ?? p.product_id ?? ""),
          name: String(p.name ?? "Product"),
          unitsSold: num(p.unitsSold ?? p.units_sold),
          revenue: num(p.revenue),
        };
      }),
    };
  },

  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    customers: AdminCustomer[];
    meta: { total: number; page: number; limit: number };
  }> {
    const response = await apiClient.get<ApiResponse<AdminCustomer[]>>("/admin/customers", {
      params,
    });
    const customers = Array.isArray(response.data.data) ? response.data.data : [];
    return {
      customers,
      meta: {
        total: response.data.meta?.total ?? customers.length,
        page: response.data.meta?.page ?? params?.page ?? 1,
        limit: response.data.meta?.limit ?? params?.limit ?? 10,
      },
    };
  },

  async getCustomerDossier(id: string): Promise<AdminCustomerDossier> {
    const response = await apiClient.get<ApiResponse<AdminCustomerDossier>>(
      `/admin/customers/${encodeURIComponent(id)}`
    );
    const data = response.data.data;
    return {
      ...data,
      profile: {
        ...data.profile,
        avatar: data.profile?.avatar ? resolveAssetUrl(data.profile.avatar) : null,
      },
    };
  },
};
