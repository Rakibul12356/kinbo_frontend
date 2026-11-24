import type { StoreOrder } from "@/lib/orders/order-store";

export interface TimelineStep {
  key: string;
  title: string;
  description: string;
}

const STEPS: TimelineStep[] = [
  {
    key: "placed",
    title: "Order Placed",
    description: "Your order was successfully placed.",
  },
  {
    key: "processing",
    title: "Processing",
    description: "We received your order and are checking it.",
  },
  {
    key: "confirmed",
    title: "Confirmed",
    description: "We have confirmed your order.",
  },
  {
    key: "packing",
    title: "Packing",
    description: "We are currently packing your order.",
  },
  {
    key: "packed",
    title: "Packed",
    description: "Your order is packed now.",
  },
  {
    key: "delivering",
    title: "Delivering",
    description: "Your order is out for delivery.",
  },
  {
    key: "delivered",
    title: "Delivered",
    description: "You have received your order.",
  },
];

/** How far along the timeline based on order status. */
export function timelineCompletedIndex(status: StoreOrder["status"]): number {
  switch (status) {
    case "pending":
      return 1;
    case "confirmed":
      return 2;
    case "shipped":
      return 5;
    case "delivered":
      return 6;
    case "cancelled":
    case "returned":
      return -1;
    default:
      return 0;
  }
}

export function buildOrderTimeline(order: StoreOrder) {
  const completedThrough = timelineCompletedIndex(order.status);
  const start = +new Date(order.createdAt);

  return STEPS.map((step, index) => {
    const done = completedThrough >= 0 && index <= completedThrough;
    const at = new Date(start + index * 45 * 60 * 1000);
    return {
      ...step,
      done,
      at: done || index === completedThrough + 1 ? at : null,
      current: completedThrough >= 0 && index === completedThrough,
    };
  });
}

export { STEPS as ORDER_TIMELINE_STEPS };
