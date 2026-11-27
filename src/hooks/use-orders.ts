"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { orderService } from "@/services/order.service";

export const ORDER_QUERY_KEYS = {
  myOrders: ["orders", "my-orders"] as const,
  adminOrders: ["orders", "admin"] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
};

export function useMyOrders() {
  const { ready, user } = useAuth();
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.myOrders,
    queryFn: () => orderService.getMyOrders(),
    enabled: ready && Boolean(user),
  });
}

export function useOrderDetail(id: string) {
  const { ready, profile, admin } = useAuth();
  return useQuery({
    queryKey: [
      ...ORDER_QUERY_KEYS.detail(id),
      admin ? "admin" : "user",
      profile?.id ?? "",
    ],
    queryFn: () =>
      admin ? orderService.getAdminOrderById(id) : orderService.getOrderById(id),
    enabled: ready && Boolean(profile) && Boolean(id),
  });
}

export function useAdminOrders() {
  const { ready, admin } = useAuth();
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.adminOrders,
    queryFn: () => orderService.getAdminOrders(),
    enabled: ready && Boolean(admin),
  });
}
