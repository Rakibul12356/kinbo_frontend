"use client";

import { useSyncExternalStore } from "react";
import {
  getAccountSnapshot,
  getServerAccountSnapshot,
  subscribeAccount,
} from "@/lib/account/account-store";

export function useAccount() {
  return useSyncExternalStore(
    subscribeAccount,
    getAccountSnapshot,
    getServerAccountSnapshot
  );
}
