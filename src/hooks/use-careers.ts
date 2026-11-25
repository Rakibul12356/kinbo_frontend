"use client";

import { useSyncExternalStore } from "react";
import {
  getServerJobs,
  listJobs,
  subscribeCareers,
} from "@/lib/careers/careers-store";

export function useJobs() {
  return useSyncExternalStore(subscribeCareers, listJobs, getServerJobs);
}
