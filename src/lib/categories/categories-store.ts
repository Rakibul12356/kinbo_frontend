"use client";

/**
 * Admin-managed category tree (category → subcategory only).
 * Seeded from the static catalog; persisted in localStorage until a backend API exists.
 */

import { CATEGORIES, slugify } from "@/lib/categories";

export interface ManagedSubcategory {
  id: string;
  name: string;
  slug: string;
}

export interface ManagedCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  accent: string;
  subcategories: ManagedSubcategory[];
}

const STORAGE_KEY = "kinbo_admin_categories";
const STORAGE_VERSION = 1;

const listeners = new Set<() => void>();
let state: ManagedCategory[] | null = null;
let snapshot: ManagedCategory[] | null = null;

function seedCategories(): ManagedCategory[] {
  return CATEGORIES.map((category) => ({
    id: `cat-${category.slug}`,
    name: category.name,
    slug: category.slug,
    description: category.description,
    accent: category.accent,
    subcategories: category.subcategories.map((sub) => ({
      id: `sub-${category.slug}-${sub.slug}`,
      name: sub.name,
      slug: sub.slug,
    })),
  }));
}

function uniqueSlug(base: string, used: Set<string>) {
  let slug = slugify(base) || "item";
  if (!used.has(slug)) return slug;
  let n = 2;
  while (used.has(`${slug}-${n}`)) n += 1;
  return `${slug}-${n}`;
}

function load(): ManagedCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedCategories();
    const parsed = JSON.parse(raw) as { version?: number; categories?: ManagedCategory[] };
    if (parsed.version === STORAGE_VERSION && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
      return parsed.categories;
    }
  } catch {
    // Corrupt storage → seed.
  }
  return seedCategories();
}

function getState(): ManagedCategory[] {
  if (typeof window === "undefined") return seedCategories();
  if (!state) state = load();
  return state;
}

function persist(next: ManagedCategory[]) {
  state = next;
  snapshot = null;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, categories: next })
    );
  } catch {
    // Keep in-memory if quota fails.
  }
  listeners.forEach((listener) => listener());
}

export function getManagedCategories(): ManagedCategory[] {
  if (snapshot) return snapshot;
  snapshot = getState();
  return snapshot;
}

export function getServerManagedCategories(): ManagedCategory[] {
  return seedCategories();
}

export function subscribeCategories(listener: () => void) {
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

export function addManagedCategory(input: { name: string; description?: string }): ManagedCategory {
  const categories = getState();
  const used = new Set(categories.map((c) => c.slug));
  const name = input.name.trim();
  const slug = uniqueSlug(name, used);
  const category: ManagedCategory = {
    id: `cat-${Date.now()}`,
    name,
    slug,
    description: input.description?.trim() || "",
    accent: "bg-slate-50 text-slate-600",
    subcategories: [],
  };
  persist([category, ...categories]);
  return category;
}

export function updateManagedCategory(
  id: string,
  input: { name: string; description?: string }
): ManagedCategory | null {
  const categories = getState();
  const index = categories.findIndex((c) => c.id === id);
  if (index < 0) return null;
  const current = categories[index];
  const name = input.name.trim();
  const used = new Set(categories.filter((c) => c.id !== id).map((c) => c.slug));
  const next: ManagedCategory = {
    ...current,
    name,
    slug: uniqueSlug(name, used),
    description: input.description?.trim() ?? current.description,
  };
  const copy = [...categories];
  copy[index] = next;
  persist(copy);
  return next;
}

export function deleteManagedCategory(id: string) {
  persist(getState().filter((c) => c.id !== id));
}

export function addManagedSubcategory(
  categoryId: string,
  name: string
): ManagedSubcategory | null {
  const categories = getState();
  const index = categories.findIndex((c) => c.id === categoryId);
  if (index < 0) return null;
  const category = categories[index];
  const used = new Set(category.subcategories.map((s) => s.slug));
  const trimmed = name.trim();
  const sub: ManagedSubcategory = {
    id: `sub-${Date.now()}`,
    name: trimmed,
    slug: uniqueSlug(trimmed, used),
  };
  const copy = [...categories];
  copy[index] = { ...category, subcategories: [...category.subcategories, sub] };
  persist(copy);
  return sub;
}

export function updateManagedSubcategory(
  categoryId: string,
  subcategoryId: string,
  name: string
): ManagedSubcategory | null {
  const categories = getState();
  const index = categories.findIndex((c) => c.id === categoryId);
  if (index < 0) return null;
  const category = categories[index];
  const subIndex = category.subcategories.findIndex((s) => s.id === subcategoryId);
  if (subIndex < 0) return null;
  const used = new Set(
    category.subcategories.filter((s) => s.id !== subcategoryId).map((s) => s.slug)
  );
  const trimmed = name.trim();
  const nextSub: ManagedSubcategory = {
    ...category.subcategories[subIndex],
    name: trimmed,
    slug: uniqueSlug(trimmed, used),
  };
  const subs = [...category.subcategories];
  subs[subIndex] = nextSub;
  const copy = [...categories];
  copy[index] = { ...category, subcategories: subs };
  persist(copy);
  return nextSub;
}

export function deleteManagedSubcategory(categoryId: string, subcategoryId: string) {
  const categories = getState();
  const index = categories.findIndex((c) => c.id === categoryId);
  if (index < 0) return;
  const category = categories[index];
  const copy = [...categories];
  copy[index] = {
    ...category,
    subcategories: category.subcategories.filter((s) => s.id !== subcategoryId),
  };
  persist(copy);
}

export function resetManagedCategories() {
  persist(seedCategories());
}
