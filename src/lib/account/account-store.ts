"use client";

/**
 * User wishlist, stock alerts, and delivery addresses (localStorage).
 * shortcut: not synced to userId across devices — wire API when auth backend exists
 */

export interface AccountProductRef {
  productId: string;
  name: string;
  image: string;
  price: number;
  addedAt: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

type AccountState = {
  wishlist: AccountProductRef[];
  notified: AccountProductRef[];
  addresses: SavedAddress[];
};

const STORAGE_KEY = "kinbo_user_account";
const STORAGE_VERSION = 1;
const EMPTY: AccountState = { wishlist: [], notified: [], addresses: [] };

let state: AccountState | null = null;
let snapshot: AccountState | null = null;
const listeners = new Set<() => void>();

function load(): AccountState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY, wishlist: [], notified: [], addresses: [] };
    const parsed = JSON.parse(raw) as { version?: number } & Partial<AccountState>;
    if (parsed.version === STORAGE_VERSION) {
      return {
        wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
        notified: Array.isArray(parsed.notified) ? parsed.notified : [],
        addresses: Array.isArray(parsed.addresses) ? parsed.addresses : [],
      };
    }
  } catch {
    // ignore corrupt data
  }
  return { wishlist: [], notified: [], addresses: [] };
}

function getState(): AccountState {
  if (typeof window === "undefined") return EMPTY;
  if (!state) state = load();
  return state;
}

function persist(next: AccountState) {
  state = next;
  snapshot = null;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, ...next })
    );
  } catch {
    // keep memory if quota fails
  }
  listeners.forEach((listener) => listener());
}

export function subscribeAccount(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      state = load();
      snapshot = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getAccountSnapshot(): AccountState {
  if (snapshot) return snapshot;
  snapshot = getState();
  return snapshot;
}

export function getServerAccountSnapshot(): AccountState {
  return EMPTY;
}

export function toggleWishlistItem(item: Omit<AccountProductRef, "addedAt">) {
  const current = getState();
  const exists = current.wishlist.some((entry) => entry.productId === item.productId);
  persist({
    ...current,
    wishlist: exists
      ? current.wishlist.filter((entry) => entry.productId !== item.productId)
      : [{ ...item, addedAt: new Date().toISOString() }, ...current.wishlist],
  });
  return !exists;
}

export function removeWishlistItem(productId: string) {
  const current = getState();
  persist({
    ...current,
    wishlist: current.wishlist.filter((entry) => entry.productId !== productId),
  });
}

export function addStockAlert(item: Omit<AccountProductRef, "addedAt">) {
  const current = getState();
  if (current.notified.some((entry) => entry.productId === item.productId)) return;
  persist({
    ...current,
    notified: [{ ...item, addedAt: new Date().toISOString() }, ...current.notified],
  });
}

export function removeStockAlert(productId: string) {
  const current = getState();
  persist({
    ...current,
    notified: current.notified.filter((entry) => entry.productId !== productId),
  });
}

export function saveAddress(
  input: Omit<SavedAddress, "id" | "isDefault"> & { id?: string; isDefault?: boolean }
): SavedAddress {
  const current = getState();
  const id = input.id ?? `addr-${Date.now()}`;
  const makeDefault = Boolean(input.isDefault) || current.addresses.length === 0;
  const nextAddr: SavedAddress = {
    id,
    label: input.label.trim() || "Home",
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    city: input.city.trim(),
    postalCode: input.postalCode.trim(),
    isDefault: makeDefault,
  };

  let addresses = current.addresses.filter((addr) => addr.id !== id);
  if (makeDefault) {
    addresses = addresses.map((addr) => ({ ...addr, isDefault: false }));
  }
  const existingIndex = current.addresses.findIndex((addr) => addr.id === id);
  if (existingIndex >= 0) {
    addresses = [...addresses];
    // keep relative order roughly by putting updated first when new
  }
  addresses = [nextAddr, ...addresses.filter((addr) => addr.id !== id)];
  persist({ ...current, addresses });
  return nextAddr;
}

export function deleteAddress(id: string) {
  const current = getState();
  let addresses = current.addresses.filter((addr) => addr.id !== id);
  if (addresses.length > 0 && !addresses.some((addr) => addr.isDefault)) {
    addresses = [{ ...addresses[0], isDefault: true }, ...addresses.slice(1)];
  }
  persist({ ...current, addresses });
}

export function setDefaultAddress(id: string) {
  const current = getState();
  persist({
    ...current,
    addresses: current.addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    })),
  });
}
