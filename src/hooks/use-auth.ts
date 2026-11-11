"use client";

import { useSyncExternalStore } from "react";
import {
  getAuthSnapshot,
  getCurrentVendor,
  getServerAuthSnapshot,
  getVerifyingVendor,
  subscribeAuth,
} from "@/lib/auth/auth-store";
import { DEMO_ADMIN, DEMO_USER } from "@/lib/auth/demo-accounts";

export function useAuth() {
  const state = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  return {
    ...state,
    vendor: getCurrentVendor(state),
    verifyingVendor: getVerifyingVendor(state),
    admin: state.session?.role === "admin" ? DEMO_ADMIN : null,
    user: state.session?.role === "user" ? DEMO_USER : null,
  };
}
