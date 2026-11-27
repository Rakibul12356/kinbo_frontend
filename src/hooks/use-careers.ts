"use client";

import { useQuery } from "@tanstack/react-query";
import { careersService } from "@/services/careers.service";

export function useJobs() {
  return useQuery({
    queryKey: ["careers", "jobs"],
    queryFn: () => careersService.getJobs(),
  });
}
