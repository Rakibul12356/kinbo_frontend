import apiClient from "@/lib/axios";
import { getCatalogProducts } from "@/lib/catalog/catalog-store";
import { CATEGORY_NAMES } from "@/lib/categories";
import { Product } from "@/types/ecommerce";
import { PRODUCTS_DATA } from "@/data/products";

export interface ProductFilterParams {
  category?: string;
  subcategory?: string;
  search?: string;
}

// Fallback demo products loaded from products.json
export const DEMO_PRODUCTS: Product[] = PRODUCTS_DATA;

const equalsIgnoreCase = (a?: string, b?: string) =>
  Boolean(a && b && a.toLowerCase() === b.toLowerCase());

function allProducts(): Product[] {
  if (typeof window === "undefined") return DEMO_PRODUCTS;
  return getCatalogProducts();
}

export const productService = {
  // Fetch all products with fallback to demo data
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>("/products", { params });
      return response.data;
    } catch {
      // Graceful fallback to demo products when backend is offline
      let products = allProducts();
      if (params?.category && params.category !== "All") {
        products = products.filter((p) => equalsIgnoreCase(p.category, params.category));
      }
      if (params?.subcategory) {
        products = products.filter((p) => equalsIgnoreCase(p.subcategory, params.subcategory));
      }
      if (params?.search) {
        const query = params.search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.tags?.some((t) => t.toLowerCase().includes(query))
        );
      }
      return products;
    }
  },

  // Fetch product by ID or slug
  async getProductById(idOrSlug: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<Product>(`/products/${idOrSlug}`);
      return response.data;
    } catch {
      const found = allProducts().find(
        (p) => p.id === idOrSlug || p.slug === idOrSlug
      );
      return found || null;
    }
  },

  // Fetch categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>("/categories");
      return response.data;
    } catch {
      return ["All", ...CATEGORY_NAMES];
    }
  },
};
