"use client";

/**
 * Frontend-only product reviews (localStorage).
 * shortcut: pending until admin approves — swap for API when backend exists
 */

export type ReviewStatus = "pending" | "approved";

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  orderId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

const STORAGE_KEY = "kinbo_product_reviews";
const STORAGE_VERSION = 1;
const EMPTY: ProductReview[] = [];

let cache: ProductReview[] | null = null;
/** Stable sorted snapshot for useSyncExternalStore. */
let sortedSnapshot: ProductReview[] | null = null;
const listeners = new Set<() => void>();

function load(): ProductReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { version?: number; reviews?: ProductReview[] };
    if (parsed.version === STORAGE_VERSION && Array.isArray(parsed.reviews)) {
      return parsed.reviews;
    }
  } catch {
    // ignore corrupt data
  }
  return [];
}

function rebuildSnapshot(reviews: ProductReview[]) {
  sortedSnapshot = [...reviews].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
}

function persist(reviews: ProductReview[]) {
  cache = reviews;
  rebuildSnapshot(reviews);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, reviews }));
  } catch {
    // keep memory if storage full
  }
  listeners.forEach((listener) => listener());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kinbo-reviews-updated"));
  }
}

function getAll(): ProductReview[] {
  if (typeof window === "undefined") return EMPTY;
  if (!cache) {
    cache = load();
    rebuildSnapshot(cache);
  }
  return cache;
}

export function subscribeReviews(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = load();
      rebuildSnapshot(cache);
      listener();
    }
  };
  const onCustom = () => listener();
  window.addEventListener("storage", onStorage);
  window.addEventListener("kinbo-reviews-updated", onCustom);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("kinbo-reviews-updated", onCustom);
  };
}

export function listAllReviews(): ProductReview[] {
  getAll();
  return sortedSnapshot ?? EMPTY;
}

export function listPendingReviews(): ProductReview[] {
  return listAllReviews().filter((r) => r.status === "pending");
}

export function listApprovedReviewsForProduct(productId: string): ProductReview[] {
  return listAllReviews().filter(
    (r) => r.productId === productId && r.status === "approved"
  );
}

export function getServerReviews(): ProductReview[] {
  return EMPTY;
}

export function findReviewForOrderProduct(orderId: string, productId: string) {
  return getAll().find((r) => r.orderId === orderId && r.productId === productId);
}

export function submitProductReview(input: {
  productId: string;
  productName: string;
  productImage: string;
  orderId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
}): { ok: true; review: ProductReview } | { ok: false; error: string } {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { ok: false, error: "Pick a rating from 1 to 5." };
  }
  if (!input.comment.trim() || input.comment.trim().length < 5) {
    return { ok: false, error: "Write at least a short review." };
  }
  if (findReviewForOrderProduct(input.orderId, input.productId)) {
    return { ok: false, error: "You already reviewed this product for this order." };
  }

  const review: ProductReview = {
    id: `rev-${Date.now()}`,
    productId: input.productId,
    productName: input.productName,
    productImage: input.productImage,
    orderId: input.orderId,
    userName: input.userName.trim() || "Customer",
    userEmail: input.userEmail.trim(),
    rating: input.rating,
    comment: input.comment.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  persist([review, ...getAll()]);
  return { ok: true, review };
}

export function approveReview(id: string) {
  persist(
    getAll().map((r) => (r.id === id ? { ...r, status: "approved" as const } : r))
  );
}

export function deleteReview(id: string) {
  persist(getAll().filter((r) => r.id !== id));
}
