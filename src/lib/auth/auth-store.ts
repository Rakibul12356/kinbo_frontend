"use client";

/**
 * Frontend-only mock auth. Everything lives in localStorage until the backend
 * auth API exists; swap these functions for API calls when it does.
 */

import { DEMO_ADMIN, DEMO_USER } from "./demo-accounts";
import type { AuthState } from "./types";

const STORAGE_KEY = "kinbo_mock_auth";
const STORAGE_VERSION = 3;

export const USER_ROUTES = {
  login: "/login",
  account: "/account",
} as const;

export const ADMIN_ROUTES = {
  login: "/login?role=admin",
  dashboard: "/admin/dashboard",
  products: "/admin/products",
  orders: "/admin/orders",
} as const;

export type ActionResult<T = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

const SERVER_STATE: AuthState = {
  ready: false,
  session: null,
};

let state: AuthState | null = null;
const listeners = new Set<() => void>();

function freshState(): AuthState {
  return {
    ready: true,
    session: null,
  };
}

function load(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === STORAGE_VERSION) {
        return { ...parsed.data, ready: true };
      }
    }
  } catch {
    // Corrupt storage falls back to a clean session.
  }
  return freshState();
}

function setState(next: AuthState) {
  state = next;
  try {
    const data = { session: next.session };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, data }));
  } catch {
    // Quota errors shouldn't break the in-memory flow.
  }
  listeners.forEach((listener) => listener());
}

function update(patch: Partial<AuthState>) {
  setState({ ...getAuthSnapshot(), ...patch });
}

export function getAuthSnapshot(): AuthState {
  if (!state) state = load();
  return state;
}

export function getServerAuthSnapshot(): AuthState {
  return SERVER_STATE;
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function loginUser(email: string, password: string): ActionResult {
  if (email.trim().toLowerCase() !== DEMO_USER.email || password !== DEMO_USER.password) {
    return { ok: false, error: "Invalid email or password." };
  }
  update({ session: { role: "user", userId: DEMO_USER.id } });
  return { ok: true };
}

export function loginAdmin(email: string, password: string): ActionResult {
  if (email.trim().toLowerCase() !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password) {
    return { ok: false, error: "Invalid admin credentials." };
  }
  update({ session: { role: "admin", userId: DEMO_ADMIN.id } });
  return { ok: true };
}

export function logout() {
  update({ session: null });
}

export function resetDemoData() {
  setState(freshState());
}
