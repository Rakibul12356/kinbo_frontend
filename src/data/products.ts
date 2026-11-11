import type { Product } from "@/types/ecommerce";
import rawProductsData from "./products.json";

/**
 * All product mock data loaded directly from products.json
 */
export const PRODUCTS_DATA: Product[] = rawProductsData as Product[];

/**
 * Returns all products
 */
export function getAllProducts(): Product[] {
  return PRODUCTS_DATA;
}

/**
 * Find product by ID
 */
export function getProductById(id: string): Product | undefined {
  return PRODUCTS_DATA.find((p) => p.id === id);
}

/**
 * Find product by slug
 */
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS_DATA.find((p) => p.slug === slug);
}

/**
 * Find product by either ID or slug
 */
export function getProductByIdOrSlug(idOrSlug: string): Product | undefined {
  return PRODUCTS_DATA.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

/**
 * Get products filtered by category name
 */
export function getProductsByCategory(categoryName: string): Product[] {
  if (!categoryName || categoryName === "All") return PRODUCTS_DATA;
  const target = categoryName.trim().toLowerCase();
  return PRODUCTS_DATA.filter((p) => p.category.toLowerCase() === target);
}

/**
 * Get products filtered by subcategory name
 */
export function getProductsBySubcategory(subcategoryName: string): Product[] {
  if (!subcategoryName) return PRODUCTS_DATA;
  const target = subcategoryName.trim().toLowerCase();
  return PRODUCTS_DATA.filter(
    (p) => p.subcategory && p.subcategory.toLowerCase() === target
  );
}

/**
 * Get featured products
 */
export function getFeaturedProducts(): Product[] {
  return PRODUCTS_DATA.filter((p) => p.isFeatured);
}

/**
 * Get new arrivals
 */
export function getNewArrivalProducts(): Product[] {
  return PRODUCTS_DATA.filter((p) => p.isNewArrival);
}

/**
 * Get discounted products (with lightning or ribbon deals)
 */
export function getDiscountedProducts(): Product[] {
  return PRODUCTS_DATA.filter(
    (p) => p.discountType || (p.originalPrice && p.originalPrice > p.price)
  );
}

/**
 * Search products by query across name, description, tags, category, subcategory
 */
export function searchProducts(query: string): Product[] {
  if (!query || !query.trim()) return PRODUCTS_DATA;
  const q = query.trim().toLowerCase();

  return PRODUCTS_DATA.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
      p.tags?.some((t) => t.toLowerCase().includes(q))
  );
}

export default PRODUCTS_DATA;
