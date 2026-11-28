"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { reviewService } from "@/services/review.service";

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ["reviews", "product", productId],
    queryFn: () => reviewService.getProductReviews(productId),
    enabled: Boolean(productId),
  });
}

export function useAdminReviews() {
  const { ready, admin } = useAuth();
  return useQuery({
    queryKey: ["reviews", "admin"],
    queryFn: () => reviewService.getAdminReviews(),
    enabled: ready && Boolean(admin),
  });
}
