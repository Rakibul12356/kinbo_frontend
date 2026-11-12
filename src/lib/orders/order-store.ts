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
const DEMO_SEEDED_KEY = "kinbo_orders_demo_v1";

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

/** Seed sample orders when the store is empty so admin overview is not blank. */
export function ensureDemoOrders() {
  if (typeof window === "undefined") return;
  if (listOrders().length > 0) {
    localStorage.setItem(DEMO_SEEDED_KEY, "1");
    return;
  }

  const customers = [
    { fullName: "Rakibul Hasan", phone: "01711001100", email: "rakib@example.com", address: "Mirpur-10", city: "Dhaka", postalCode: "1216" },
    { fullName: "Nusrat Jahan", phone: "01822002200", email: "nusrat@example.com", address: "Dhanmondi 27", city: "Dhaka", postalCode: "1209" },
    { fullName: "Imran Hossain", phone: "01933003300", email: "imran@example.com", address: "Agrabad", city: "Chittagong", postalCode: "4100" },
    { fullName: "Sadia Akter", phone: "01644004400", email: "sadia@example.com", address: "Zindabazar", city: "Sylhet", postalCode: "3100" },
    { fullName: "Tanvir Ahmed", phone: "01555005500", email: "tanvir@example.com", address: "Shaheb Bazar", city: "Rajshahi", postalCode: "6000" },
    { fullName: "Farzana Islam", phone: "01366006600", email: "farzana@example.com", address: "Sonadanga", city: "Khulna", postalCode: "9100" },
  ];

  const catalog = [
    { productId: "p1", name: "Men's Premium Oxford Shirt", image: "/images/products/shirt.jpg", price: 1890 },
    { productId: "p2", name: "Women's Floral Kurti", image: "/images/products/kurti.jpg", price: 1490 },
    { productId: "p3", name: "Kids Organic Cotton Tee", image: "/images/products/tee.jpg", price: 890 },
    { productId: "p4", name: "Apex Ultra-Light Running Shoes", image: "/images/products/shoes.jpg", price: 2890 },
    { productId: "p5", name: "Wireless Noise-Cancel Buds", image: "/images/products/buds.jpg", price: 3290 },
  ];

  const statuses: StoreOrder["status"][] = [
    "delivered",
    "delivered",
    "shipped",
    "confirmed",
    "pending",
    "delivered",
    "returned",
    "cancelled",
    "shipped",
    "delivered",
    "confirmed",
    "pending",
    "returned",
    "delivered",
    "shipped",
    "delivered",
    "confirmed",
    "delivered",
  ];

  const demoOrders: StoreOrder[] = statuses.map((status, index) => {
    const created = new Date();
    created.setHours(10 + (index % 8), (index * 7) % 60, 0, 0);
    created.setDate(created.getDate() - (index % 14));

    const customer = customers[index % customers.length];
    const product = catalog[index % catalog.length];
    const quantity = (index % 3) + 1;
    const subtotal = product.price * quantity;
    const discount = index % 4 === 0 ? Math.round(subtotal * 0.08) : 0;
    const shippingFee = subtotal - discount >= 1999 ? 0 : 80;
    const total = subtotal - discount + shippingFee;

    return {
      id: `KB-DEMO${1000 + index}`,
      createdAt: created.toISOString(),
      status,
      shipping: { ...customer },
      items: [
        {
          productId: product.productId,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
        },
      ],
      subtotal,
      discount,
      shippingFee,
      total,
      couponCode: discount > 0 ? "KINBO8" : null,
    };
  });

  const notices: AdminNotification[] = demoOrders.slice(0, 5).map((order, i) => ({
    id: `ntf-demo-${order.id}`,
    createdAt: order.createdAt,
    title: `New order ${order.id}`,
    message: `${order.shipping.fullName} placed an order for ${formatMoney(order.total)} (${order.items.length} item${order.items.length === 1 ? "" : "s"}).`,
    orderId: order.id,
    read: i > 1,
  }));

  writeJson(ORDERS_KEY, demoOrders.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
  writeJson(NOTICES_KEY, notices);
  localStorage.setItem(DEMO_SEEDED_KEY, "1");
  notifyListeners();
}
