"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supportService } from "@/services/support.service";

export function useAdminSupportTickets() {
  const { ready, admin } = useAuth();
  return useQuery({
    queryKey: ["support", "admin"],
    queryFn: () => supportService.getAdminTickets(),
    enabled: ready && Boolean(admin),
  });
}
