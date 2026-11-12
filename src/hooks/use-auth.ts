"use client";

import { useSyncExternalStore } from "react";
import {
  findUserById,
  getAuthSnapshot,
  getServerAuthSnapshot,
  subscribeAuth,
} from "@/lib/auth/auth-store";
import { DEMO_ADMIN } from "@/lib/auth/demo-accounts";

export function useAuth() {
  const state = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  const session = state.session;
  return {
    ...state,
    admin: session?.role === "admin" ? DEMO_ADMIN : null,
    user: session?.role === "user" ? findUserById(session.userId) : null,
  };
}
