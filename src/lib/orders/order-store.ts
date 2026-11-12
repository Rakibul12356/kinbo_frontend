"use client";

/**
 * Frontend-only order + admin notification store (localStorage).
 * Swap for API calls when the backend exists.
 */

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface StoreOrder {
  id: string;
  createdAt: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";
  shipping: ShippingInfo;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string | null;
}

export interface AdminNotification {
  id: string;
  createdAt: string;
  title: string;
  message: string;
  orderId: string;
  read: boolean;
}

const ORDERS_KEY = "kinbo_orders";
const NOTICES_KEY = "kinbo_admin_notifications";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function notifyListeners() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("kinbo-orders-updated"));
}

export function listOrders(): StoreOrder[] {
  return readJson<StoreOrder[]>(ORDERS_KEY, []).sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
}

export function getOrder(id: string): StoreOrder | undefined {
  return listOrders().find((o) => o.id === id);
}

export function listAdminNotifications(): AdminNotification[] {
  return readJson<AdminNotification[]>(NOTICES_KEY, []).sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
}

export function unreadAdminNotificationCount(): number {
  return listAdminNotifications().filter((n) => !n.read).length;
}

export function markAdminNotificationRead(id: string) {
  const next = listAdminNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  writeJson(NOTICES_KEY, next);
  notifyListeners();
}

export function markAllAdminNotificationsRead() {
  const next = listAdminNotifications().map((n) => ({ ...n, read: true }));
  writeJson(NOTICES_KEY, next);
  notifyListeners();
}

export function updateOrderStatus(id: string, status: StoreOrder["status"]) {
  const next = listOrders().map((o) => (o.id === id ? { ...o, status } : o));
  writeJson(ORDERS_KEY, next);
  notifyListeners();
}

function nextOrderId(): string {
  const stamp = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 90 + 10);
  return `KB-${stamp}${rand}`;
}

export function placeOrder(input: {
  shipping: ShippingInfo;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string | null;
}): StoreOrder {
  const order: StoreOrder = {
    id: nextOrderId(),
    createdAt: new Date().toISOString(),
    status: "pending",
    shipping: input.shipping,
    items: input.items,
    subtotal: input.subtotal,
    discount: input.discount,
    shippingFee: input.shippingFee,
    total: input.total,
    couponCode: input.couponCode ?? null,
  };

  const orders = listOrders();
  writeJson(ORDERS_KEY, [order, ...orders]);

  const notice: AdminNotification = {
    id: `ntf-${order.id}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    title: `New order ${order.id}`,
    message: `${order.shipping.fullName} placed an order for ${formatMoney(order.total)} (${order.items.length} item${order.items.length === 1 ? "" : "s"}).`,
    orderId: order.id,
    read: false,
  };
  const notices = listAdminNotifications();
  writeJson(NOTICES_KEY, [notice, ...notices]);

  notifyListeners();
  return order;
}

function formatMoney(amount: number) {
  return `৳${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
}

export function subscribeOrders(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => listener();
  window.addEventListener("kinbo-orders-updated", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("kinbo-orders-updated", handler);
    window.removeEventListener("storage", handler);
  };
}
