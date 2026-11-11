import { PRODUCTS_DATA } from "@/data/products";
import { slugify } from "@/lib/categories";
import type { Product } from "@/types/ecommerce";

const STORAGE_KEY = "kinbo_catalog_products";
const STORAGE_VERSION = 1;
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

let added: Product[] | null = null;
const listeners = new Set<() => void>();

function load(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { version?: number; products?: Product[] };
      if (parsed.version === STORAGE_VERSION && Array.isArray(parsed.products)) {
        return parsed.products;
      }
    }
  } catch {
    // Ignore corrupt catalog data and start from the demo catalog.
  }
  return [];
}

function persist(products: Product[]) {
  added = products;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, products }));
  } catch {
    // Keep the in-memory catalog if storage is full.
  }
  listeners.forEach((listener) => listener());
}

export function getAddedProducts(): Product[] {
  if (typeof window === "undefined") return EMPTY;
  if (!added) added = load();
  return added;
}

export function getServerAddedProducts(): Product[] {
  return EMPTY;
}

export function subscribeCatalog(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      added = load();
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
  return [...getAddedProducts(), ...PRODUCTS_DATA];
}

export function findCatalogProduct(idOrSlug: string): Product | undefined {
  return getCatalogProducts().find((product) => product.id === idOrSlug || product.slug === idOrSlug);
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
  persist([product, ...getAddedProducts()]);
  return product;
}

export function removeCatalogProduct(id: string) {
  persist(getAddedProducts().filter((product) => product.id !== id));
}
