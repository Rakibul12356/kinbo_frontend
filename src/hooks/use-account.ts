"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { accountService } from "@/services/account.service";

export const ACCOUNT_QUERY_KEYS = {
  addresses: ["account", "addresses"] as const,
  wishlist: ["account", "wishlist"] as const,
  notified: ["account", "notified"] as const,
};

export function useAddresses() {
  const { ready, user } = useAuth();
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.addresses,
    queryFn: () => accountService.getAddresses(),
    enabled: ready && Boolean(user),
  });
}

export function useWishlist() {
  const { ready, user } = useAuth();
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.wishlist,
    queryFn: () => accountService.getWishlist(),
    enabled: ready && Boolean(user),
  });
}

export function useNotifiedProducts() {
  const { ready, user } = useAuth();
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.notified,
    queryFn: () => accountService.getNotifiedProducts(),
    enabled: ready && Boolean(user),
  });
}
