"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { returnsService } from "@/services/returns.service";
import type { ReturnRequestStatus } from "@/types/ecommerce";

export const RETURN_QUERY_KEYS = {
  admin: (status: string, page: number) =>
    ["admin", "returns", status, page] as const,
};

export function useAdminReturns(params: {
  status?: ReturnRequestStatus | "all";
  page?: number;
  limit?: number;
}) {
  const { ready, admin } = useAuth();
  const status = params.status ?? "all";
  const page = params.page ?? 1;
  const limit = params.limit ?? 15;

  return useQuery({
    queryKey: RETURN_QUERY_KEYS.admin(status, page),
    queryFn: () => returnsService.getAdminReturns({ status, page, limit }),
    enabled: ready && Boolean(admin),
  });
}
