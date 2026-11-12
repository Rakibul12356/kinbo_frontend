"use client";

export interface AdminStoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  defaultShippingFee: number;
  freeShippingMin: number;
  currencyLabel: string;
  notifyNewOrders: boolean;
  notifyLowStock: boolean;
}

const STORAGE_KEY = "kinbo_admin_settings";
const STORAGE_VERSION = 1;

export const DEFAULT_SETTINGS: AdminStoreSettings = {
  storeName: "Kinbo",
  supportEmail: "support@kinbo.com",
  supportPhone: "01700000000",
  defaultShippingFee: 80,
  freeShippingMin: 1999,
  currencyLabel: "BDT (৳)",
  notifyNewOrders: true,
  notifyLowStock: true,
};

export function loadAdminSettings(): AdminStoreSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as { version?: number; settings?: AdminStoreSettings };
    if (parsed.version === STORAGE_VERSION && parsed.settings) {
      return { ...DEFAULT_SETTINGS, ...parsed.settings };
    }
  } catch {
    // Ignore corrupt settings.
  }
  return DEFAULT_SETTINGS;
}

export function saveAdminSettings(settings: AdminStoreSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: STORAGE_VERSION, settings })
  );
}
