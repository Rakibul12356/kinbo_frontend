"use client";

/**
 * Frontend-only mock auth. Everything lives in localStorage until the backend
 * auth API exists; swap these functions for API calls when it does.
 */

import { DEMO_ADMIN, DEMO_USER } from "./demo-accounts";
import type { AdminAccount, AuthState } from "./types";
import { normalizePhone } from "./validation";

const STORAGE_KEY = "kinbo_mock_auth";
const USERS_KEY = "kinbo_mock_users";
const STORAGE_VERSION = 3;

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
  customers: "/admin/customers",
  reports: "/admin/reports",
  settings: "/admin/settings",
  notifications: "/admin/notifications",
  reviews: "/admin/reviews",
  careers: "/admin/careers",
} as const;

const RESET_TOKENS_KEY = "kinbo_password_reset_tokens";
const PASSWORD_OVERRIDES_KEY = "kinbo_password_overrides";

type ResetTokenRecord = {
  email: string;
  token: string;
  expiresAt: number;
};

function loadResetTokens(): ResetTokenRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RESET_TOKENS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ResetTokenRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveResetTokens(tokens: ResetTokenRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    // ignore
  }
}

function loadPasswordOverrides(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PASSWORD_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function savePasswordOverrides(map: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PASSWORD_OVERRIDES_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function effectivePassword(account: AdminAccount): string {
  const overrides = loadPasswordOverrides();
  return overrides[account.email] ?? account.password;
}

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

function loadRegisteredUsers(): AdminAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users: AdminAccount[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore quota
  }
}

export function findUserById(userId: string): AdminAccount | null {
  if (userId === DEMO_USER.id) return DEMO_USER;
  if (userId === DEMO_ADMIN.id) return DEMO_ADMIN;
  return loadRegisteredUsers().find((u) => u.id === userId) ?? null;
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
    if (e.key === STORAGE_KEY || e.key === USERS_KEY) {
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
  const normalized = email.trim().toLowerCase();
  if (normalized === DEMO_USER.email && password === effectivePassword(DEMO_USER)) {
    update({ session: { role: "user", userId: DEMO_USER.id } });
    return { ok: true };
  }
  const match = loadRegisteredUsers().find(
    (u) => u.email === normalized && effectivePassword(u) === password,
  );
  if (!match) return { ok: false, error: "Invalid email or password." };
  update({ session: { role: "user", userId: match.id } });
  return { ok: true };
}

export function loginAdmin(email: string, password: string): ActionResult {
  const normalized = email.trim().toLowerCase();
  if (normalized !== DEMO_ADMIN.email || password !== effectivePassword(DEMO_ADMIN)) {
    return { ok: false, error: "Invalid admin credentials." };
  }
  update({ session: { role: "admin", userId: DEMO_ADMIN.id } });
  return { ok: true };
}

export function registerUser(
  fullName: string,
  email: string,
  password: string,
): ActionResult {
  const normalized = email.trim().toLowerCase();
  if (normalized === DEMO_USER.email || normalized === DEMO_ADMIN.email) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const users = loadRegisteredUsers();
  if (users.some((u) => u.email === normalized)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const account: AdminAccount = {
    id: `user-${Date.now()}`,
    fullName: fullName.trim(),
    email: normalized,
    password,
  };
  saveRegisteredUsers([...users, account]);
  update({ session: { role: "user", userId: account.id } });
  return { ok: true };
}

/** shortcut: phone OTP mocked as instant login — wire SMS OTP when auth backend exists */
export function loginWithPhone(phone: string, fullName?: string): ActionResult {
  const normalized = normalizePhone(phone);
  const users = loadRegisteredUsers();
  let match = users.find((u) => u.email === `${normalized}@phone.kinbo`);
  if (!match) {
    match = {
      id: `user-phone-${normalized}`,
      fullName: fullName?.trim() || `User ${normalized.slice(-4)}`,
      email: `${normalized}@phone.kinbo`,
      password: "",
    };
    saveRegisteredUsers([...users, match]);
  } else if (fullName?.trim()) {
    match = { ...match, fullName: fullName.trim() };
    saveRegisteredUsers(users.map((u) => (u.id === match!.id ? match! : u)));
  }
  update({ session: { role: "user", userId: match.id } });
  return { ok: true };
}

/** shortcut: mock Google only — wire real OAuth when auth backend exists */
export function loginWithGoogle(): ActionResult {
  const users = loadRegisteredUsers();
  let google = users.find((u) => u.email === "google@kinbo.com");
  if (!google) {
    google = {
      id: "user-google",
      fullName: "Google User",
      email: "google@kinbo.com",
      password: "",
    };
    saveRegisteredUsers([...users, google]);
  }
  update({ session: { role: "user", userId: google.id } });
  return { ok: true };
}

export function logout() {
  update({ session: null });
}

export function resetDemoData() {
  setState(freshState());
}

/**
 * Mock forgot-password: creates a reset token (no real email).
 * shortcut: show token on success UI until Nodemailer backend exists
 */
export function requestPasswordReset(
  email: string
): ActionResult<{ token: string; resetPath: string }> {
  const normalized = email.trim().toLowerCase();
  const known =
    normalized === DEMO_USER.email ||
    normalized === DEMO_ADMIN.email ||
    loadRegisteredUsers().some((u) => u.email === normalized);

  if (!known) {
    // Same response shape as success to avoid email enumeration in real apps;
    // for this demo we still tell the user if unknown so testing is easier.
    return { ok: false, error: "No account found with that email." };
  }

  const token = `rst-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const expiresAt = Date.now() + 1000 * 60 * 30; // 30 minutes
  const tokens = loadResetTokens().filter((t) => t.email !== normalized && t.expiresAt > Date.now());
  tokens.push({ email: normalized, token, expiresAt });
  saveResetTokens(tokens);

  return {
    ok: true,
    token,
    resetPath: `/reset-password?token=${encodeURIComponent(token)}`,
  };
}

export function findResetToken(token: string): ResetTokenRecord | null {
  const match = loadResetTokens().find((t) => t.token === token);
  if (!match) return null;
  if (match.expiresAt < Date.now()) return null;
  return match;
}

export function resetPasswordWithToken(token: string, password: string): ActionResult {
  const record = findResetToken(token);
  if (!record) return { ok: false, error: "This reset link is invalid or has expired." };

  const users = loadRegisteredUsers();
  const userIndex = users.findIndex((u) => u.email === record.email);

  if (userIndex >= 0) {
    const next = [...users];
    next[userIndex] = { ...next[userIndex], password };
    saveRegisteredUsers(next);
  } else if (record.email === DEMO_USER.email || record.email === DEMO_ADMIN.email) {
    const overrides = loadPasswordOverrides();
    overrides[record.email] = password;
    savePasswordOverrides(overrides);
  } else {
    return { ok: false, error: "Account no longer exists." };
  }

  saveResetTokens(loadResetTokens().filter((t) => t.token !== token));
  return { ok: true };
}
