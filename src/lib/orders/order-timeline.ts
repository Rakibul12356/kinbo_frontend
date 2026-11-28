import type { OrderDetail, OrderStatus, OrderStatusHistoryEntry } from "@/types/ecommerce";

export interface TimelineStep {
  key: OrderStatus;
  title: string;
  description: string;
}

const STEPS: TimelineStep[] = [
  {
    key: "PENDING",
    title: "Order Placed",
    description: "Your order was successfully placed.",
  },
  {
    key: "PROCESSING",
    title: "Processing",
    description: "We received your order and are verifying it.",
  },
  {
    key: "CONFIRMED",
    title: "Confirmed",
    description: "We have confirmed your order and reserved stock.",
  },
  {
    key: "PACKING",
    title: "Packing",
    description: "We are currently packing your order.",
  },
  {
    key: "PACKED",
    title: "Packed",
    description: "Your order is packed and ready for dispatch.",
  },
  {
    key: "DELIVERING",
    title: "Delivering",
    description: "Your order is out for delivery.",
  },
  {
    key: "DELIVERED",
    title: "Delivered",
    description: "You have received your order.",
  },
];

const PIPELINE_ORDER: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "CONFIRMED",
  "PACKING",
  "PACKED",
  "DELIVERING",
  "DELIVERED",
];

export function timelineCompletedIndex(status: OrderStatus): number {
  const idx = PIPELINE_ORDER.indexOf(status);
  return idx;
}

export function buildOrderTimeline(order: OrderDetail) {
  const completedThrough = timelineCompletedIndex(order.status);
  const historyMap = new Map<OrderStatus, OrderStatusHistoryEntry>();
  for (const entry of order.statusHistory ?? []) {
    historyMap.set(entry.status, entry);
  }

  return STEPS.map((step, index) => {
    const historyEntry = historyMap.get(step.key);
    const done =
      Boolean(historyEntry) ||
      (completedThrough >= 0 && index <= completedThrough);
    return {
      ...step,
      description: historyEntry?.note || step.description,
      done,
      at: historyEntry?.createdAt ? new Date(historyEntry.createdAt) : null,
      current: completedThrough >= 0 && index === completedThrough,
    };
  });
}

export { STEPS as ORDER_TIMELINE_STEPS };
