import { PRODUCTS_DATA } from "@/data/products";
import { slugify } from "@/lib/categories";
import type { Product } from "@/types/ecommerce";

const STORAGE_KEY = "kinbo_catalog_products";
const STORAGE_VERSION = 2;
const EMPTY: Product[] = [];

export const PLACEHOLDER_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

export interface NewProductInput {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  stock: number;
  imageUrl?: string;
  isFeatured?: boolean;
}

export type ProductUpdateInput = NewProductInput;

type CatalogState = {
  products: Product[];
  overrides: Record<string, Partial<Product>>;
  removedIds: string[];
};

const EMPTY_STATE: CatalogState = { products: [], overrides: {}, removedIds: [] };

let state: CatalogState | null = null;
/** Cached for useSyncExternalStore — getSnapshot must return a stable reference. */
let catalogSnapshot: Product[] | null = null;
const listeners = new Set<() => void>();

function invalidateCatalogSnapshot() {
  catalogSnapshot = null;
}

function load(): CatalogState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw) as {
      version?: number;
      products?: Product[];
      overrides?: Record<string, Partial<Product>>;
      removedIds?: string[];
    };
    if (parsed.version === STORAGE_VERSION && Array.isArray(parsed.products)) {
      return {
        products: parsed.products,
        overrides: parsed.overrides ?? {},
        removedIds: parsed.removedIds ?? [],
      };
    }
    // Migrate v1 (admin products only).
    if (parsed.version === 1 && Array.isArray(parsed.products)) {
      return { products: parsed.products, overrides: {}, removedIds: [] };
    }
  } catch {
    // Ignore corrupt catalog data.
  }
  return { ...EMPTY_STATE };
}

function getState(): CatalogState {
  if (typeof window === "undefined") return EMPTY_STATE;
  if (!state) state = load();
  return state;
}

function persist(next: CatalogState) {
  state = next;
  invalidateCatalogSnapshot();
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        products: next.products,
        overrides: next.overrides,
        removedIds: next.removedIds,
      })
    );
  } catch {
    // Keep in-memory state if storage is full.
  }
  listeners.forEach((listener) => listener());
}

export function getAddedProducts(): Product[] {
  if (typeof window === "undefined") return EMPTY;
  return getState().products;
}

export function getServerAddedProducts(): Product[] {
  return EMPTY;
}

export function subscribeCatalog(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      state = load();
      invalidateCatalogSnapshot();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getCatalogProducts(): Product[] {
  if (catalogSnapshot) return catalogSnapshot;
  const { products, overrides, removedIds } = getState();
  const removed = new Set(removedIds);
  const catalog = PRODUCTS_DATA.filter((product) => !removed.has(product.id)).map((product) => {
    const patch = overrides[product.id];
    return patch ? { ...product, ...patch, id: product.id } : product;
  });
  catalogSnapshot = [...products, ...catalog];
  return catalogSnapshot;
}

export function findCatalogProduct(idOrSlug: string): Product | undefined {
  return getCatalogProducts().find((product) => product.id === idOrSlug || product.slug === idOrSlug);
}

export function isAdminOwnedProduct(product: Product) {
  return product.id.startsWith("prod-admin-") || product.tags?.includes("Admin") === true;
}

export function addCatalogProduct(input: NewProductInput): Product {
  const id = `prod-admin-${Date.now()}`;
  const base = slugify(input.name) || "product";
  const product: Product = {
    id,
    name: input.name.trim(),
    slug: `${base}-${id.slice(-6)}`,
    description: input.description.trim(),
    price: input.price,
    originalPrice: input.originalPrice,
    category: input.category,
    subcategory: input.subcategory || undefined,
    rating: 0,
    reviewCount: 0,
    images: [input.imageUrl?.trim() || PLACEHOLDER_PRODUCT_IMAGE],
    stock: input.stock,
    isFeatured: input.isFeatured,
    isNewArrival: true,
    deliveryTime: "24-48 HOURS",
    unit: "Piece",
    tags: ["Admin"],
  };
  const current = getState();
  persist({ ...current, products: [product, ...current.products] });
  return product;
}

function applyFields(product: Product, input: ProductUpdateInput): Product {
  return {
    ...product,
    name: input.name.trim(),
    description: input.description.trim(),
    price: input.price,
    originalPrice: input.originalPrice,
    category: input.category,
    subcategory: input.subcategory || undefined,
    stock: input.stock,
    images: [input.imageUrl?.trim() || product.images[0] || PLACEHOLDER_PRODUCT_IMAGE],
    isFeatured: input.isFeatured,
  };
}

export function updateCatalogProduct(id: string, input: ProductUpdateInput): Product | null {
  const current = getState();
  const adminIndex = current.products.findIndex((product) => product.id === id);
  if (adminIndex >= 0) {
    const updated = applyFields(current.products[adminIndex], input);
    const products = current.products.map((product, index) =>
      index === adminIndex ? updated : product
    );
    persist({ ...current, products });
    return updated;
  }

  const base = PRODUCTS_DATA.find((product) => product.id === id);
  if (!base || current.removedIds.includes(id)) return null;

  const merged = applyFields({ ...base, ...current.overrides[id] }, input);
  persist({
    ...current,
    overrides: {
      ...current.overrides,
      [id]: {
        name: merged.name,
        description: merged.description,
        price: merged.price,
        originalPrice: merged.originalPrice,
        category: merged.category,
        subcategory: merged.subcategory,
        stock: merged.stock,
        images: merged.images,
        isFeatured: merged.isFeatured,
      },
    },
  });
  return merged;
}

export function setCatalogProductOutOfStock(id: string): Product | null {
  const product = findCatalogProduct(id);
  if (!product) return null;
  return updateCatalogProduct(id, {
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    category: product.category,
    subcategory: product.subcategory,
    stock: 0,
    imageUrl: product.images[0],
    isFeatured: product.isFeatured,
  });
}

export function removeCatalogProduct(id: string) {
  const current = getState();
  const overrides = { ...current.overrides };
  delete overrides[id];

  if (current.products.some((product) => product.id === id)) {
    persist({
      ...current,
      products: current.products.filter((product) => product.id !== id),
      overrides,
    });
    return;
  }
  if (!PRODUCTS_DATA.some((product) => product.id === id)) return;
  persist({
    ...current,
    overrides,
    removedIds: current.removedIds.includes(id)
      ? current.removedIds
      : [...current.removedIds, id],
  });
}
