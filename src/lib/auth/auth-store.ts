"use client";

import { extractApiError } from "@/lib/axios";
import { authService } from "@/services/auth.service";
import type { UserProfile } from "@/types/ecommerce";
import type { AuthState, Session } from "./types";

const TOKEN_KEY = "token";
const PROFILE_KEY = "kinbo_user_profile";

export const USER_ROUTES = {
  login: "/?auth=login",
  signup: "/?auth=signup",
  account: "/account",
} as const;

export const ADMIN_ROUTES = {
  login: "/?auth=login",
  dashboard: "/admin/dashboard",
  products: "/admin/products",
  productNew: "/admin/products/new",
  productDetail: (id: string) => `/admin/products/${id}`,
  productEdit: (id: string) => `/admin/products/${id}/edit`,
  categories: "/admin/categories",
  orders: "/admin/orders",
  orderDetail: (id: string) => `/admin/orders/${id}`,
  returns: "/admin/returns",
  customers: "/admin/customers",
  reports: "/admin/reports",
  settings: "/admin/settings",
  notifications: "/admin/notifications",
  reviews: "/admin/reviews",
  careers: "/admin/careers",
} as const;

export type ActionResult<T = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

const SERVER_STATE: AuthState = {
  ready: false,
  session: null,
  profile: null,
};

let state: AuthState = SERVER_STATE;
let hydrated = false;
let hydratingPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function toSession(profile: UserProfile | null): Session | null {
  if (!profile) return null;
  return {
    role: profile.role === "ADMIN" ? "admin" : "user",
    userId: profile.id,
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function setAuthState(profile: UserProfile | null, ready = true) {
  state = {
    ready,
    session: toSession(profile),
    profile,
  };
  if (typeof window !== "undefined") {
    try {
      if (profile) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(PROFILE_KEY);
      }
    } catch {
      // Ignore quota errors
    }
  }
  emit();
}

function readCachedProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function hydrateAuth(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (hydrated) return Promise.resolve();
  if (hydratingPromise) return hydratingPromise;

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    hydrated = true;
    setAuthState(null, true);
    return Promise.resolve();
  }

  const cached = readCachedProfile();
  if (cached) {
    state = {
      ready: true,
      session: toSession(cached),
      profile: cached,
    };
    emit();
  }

  hydratingPromise = authService
    .getMe()
    .then((profile) => {
      hydrated = true;
      setAuthState(profile, true);
    })
    .catch(() => {
      hydrated = true;
      localStorage.removeItem(TOKEN_KEY);
      setAuthState(null, true);
    })
    .finally(() => {
      hydratingPromise = null;
    });

  return hydratingPromise;
}

export function getAuthSnapshot(): AuthState {
  return state;
}

export function getServerAuthSnapshot(): AuthState {
  return SERVER_STATE;
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    const onUnauthorized = () => {
      hydrated = true;
      setAuthState(null, true);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY || e.key === PROFILE_KEY) {
        const cached = readCachedProfile();
        setAuthState(cached, true);
      }
    };
    window.addEventListener("kinbo-auth-unauthorized", onUnauthorized);
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("kinbo-auth-unauthorized", onUnauthorized);
      window.removeEventListener("storage", onStorage);
    };
  }
  return () => {
    listeners.delete(listener);
  };
}

export async function loginAccount(
  email: string,
  password: string
): Promise<ActionResult<{ user: UserProfile }>> {
  try {
    const { token, user } = await authService.login({
      email: email.trim().toLowerCase(),
      password,
    });
    localStorage.setItem(TOKEN_KEY, token);
    hydrated = true;
    setAuthState(user, true);
    window.dispatchEvent(new Event("kinbo-auth-changed"));
    return { ok: true, user };
  } catch (error) {
    return { ok: false, error: extractApiError(error, "Invalid email or password.") };
  }
}

export async function registerAccount(
  name: string,
  email: string,
  password: string,
  phone: string
): Promise<ActionResult<{ user: UserProfile }>> {
  try {
    const { token, user } = await authService.register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
    });
    localStorage.setItem(TOKEN_KEY, token);
    hydrated = true;
    setAuthState(user, true);
    window.dispatchEvent(new Event("kinbo-auth-changed"));
    return { ok: true, user };
  } catch (error) {
    return { ok: false, error: extractApiError(error, "Could not create account.") };
  }
}

export async function refreshCurrentUser(): Promise<UserProfile | null> {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    setAuthState(null, true);
    return null;
  }
  try {
    const profile = await authService.getMe();
    setAuthState(profile, true);
    return profile;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    setAuthState(null, true);
    return null;
  }
}

export function setCurrentUserProfile(profile: UserProfile) {
  hydrated = true;
  setAuthState(profile, true);
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    window.dispatchEvent(new Event("kinbo-auth-changed"));
  }
  hydrated = true;
  setAuthState(null, true);
}
