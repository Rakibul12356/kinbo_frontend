"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSupportTickets,
  listSupportTickets,
  subscribeSupport,
} from "@/lib/support/support-store";

export function useSupportTickets() {
  return useSyncExternalStore(
    subscribeSupport,
    listSupportTickets,
    getServerSupportTickets
  );
}
