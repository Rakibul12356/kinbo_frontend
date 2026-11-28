"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getAuthSnapshot,
  getServerAuthSnapshot,
  hydrateAuth,
  subscribeAuth,
} from "@/lib/auth/auth-store";

export function useAuth() {
  useEffect(() => {
    void hydrateAuth();
  }, []);

  const state = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getServerAuthSnapshot
  );

  const profile = state.profile;

  return {
    ...state,
    profile,
    admin: profile?.role === "ADMIN" ? profile : null,
    user: profile?.role === "USER" ? profile : null,
  };
}
