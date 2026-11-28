import apiClient, { resolveAssetUrl } from "@/lib/axios";
import type {
  ApiResponse,
  CategoryItem,
  Product,
  ProductReviewItem,
  SubcategoryItem,
} from "@/types/ecommerce";

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-low-high" | "price-high-low" | "featured";
}

export interface CreateProductPayload {
  name: string;
  slug?: string;
  description: string;
  price: number;
  discountPercent?: number;
  stock: number;
  categoryId: string;
  subcategoryId?: string;
  brand?: string;
  isFeatured?: boolean;
  /** Legacy JSON shape — prefer imageFiles / imageUrls. */
  images?: Array<{ url: string; isPrimary: boolean }>;
  /** Local files for multipart upload (field name: images). Max 5. */
  imageFiles?: File[];
  /** External CDN/URLs when no files are uploaded. */
  imageUrls?: string[];
}

function parseImageUrlList(raw?: string | string[]): string[] {
  if (!raw) return [];
  const list = Array.isArray(raw)
    ? raw
    : raw
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
  return list.slice(0, 5);
}

function buildProductFormData(payload: CreateProductPayload | Partial<CreateProductPayload>) {
  const formData = new FormData();
  if (payload.name !== undefined) formData.append("name", payload.name);
  if (payload.slug) formData.append("slug", payload.slug);
  if (payload.description !== undefined) formData.append("description", payload.description);
  if (payload.price !== undefined) formData.append("price", String(payload.price));
  if (payload.discountPercent !== undefined) {
    formData.append("discountPercent", String(payload.discountPercent));
  }
  if (payload.stock !== undefined) formData.append("stock", String(payload.stock));
  if (payload.categoryId) formData.append("categoryId", payload.categoryId);
  if (payload.subcategoryId) formData.append("subcategoryId", payload.subcategoryId);
  if (payload.brand !== undefined) formData.append("brand", payload.brand);
  if (payload.isFeatured !== undefined) {
    formData.append("isFeatured", payload.isFeatured ? "true" : "false");
  }
  for (const file of payload.imageFiles ?? []) {
    formData.append("images", file);
  }
  return formData;
}

interface RawProductImage {
  id?: string;
  url: string;
  isPrimary?: boolean;
}

interface RawCategoryRef {
  id: string;
  name: string;
  slug: string;
}

interface RawApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPercent?: number;
  finalPrice?: number;
  stock: number;
  isOutOfStockManual?: boolean;
  isFeatured?: boolean;
  brand?: string | null;
  category?: RawCategoryRef | string | null;
  subcategory?: RawCategoryRef | string | null;
  images?: Array<RawProductImage | string>;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    user?: { name: string; avatar: string | null };
    createdAt: string;
  }>;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
}

export function mapApiProduct(raw: RawApiProduct): Product {
  const basePrice = Number(raw.price ?? 0);
  const sellingPrice =
    raw.finalPrice !== undefined && raw.finalPrice !== null
      ? Number(raw.finalPrice)
      : basePrice;
  const discountPercent = Number(raw.discountPercent ?? 0);
  const hasDiscount = discountPercent > 0 || basePrice > sellingPrice;

  const rawImages = Array.isArray(raw.images) ? raw.images : [];
  const sortedImages = [...rawImages].sort((a, b) => {
    const aPrim = typeof a === "object" && a.isPrimary ? 1 : 0;
    const bPrim = typeof b === "object" && b.isPrimary ? 1 : 0;
    return bPrim - aPrim;
  });
  const images = sortedImages
    .map((img) => resolveAssetUrl(typeof img === "string" ? img : img.url))
    .filter(Boolean);

  const reviews: ProductReviewItem[] = Array.isArray(raw.reviews)
    ? raw.reviews.map((rev) => ({
        id: rev.id,
        rating: Number(rev.rating ?? 0),
        comment: rev.comment,
        user: {
          name: rev.user?.name || "Customer",
          avatar: rev.user?.avatar ? resolveAssetUrl(rev.user.avatar) : null,
        },
        createdAt: rev.createdAt,
      }))
    : [];

  const computedReviewCount =
    raw.reviewCount !== undefined ? Number(raw.reviewCount) : reviews.length;
  const computedRating =
    raw.rating !== undefined
      ? Number(raw.rating)
      : reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

  const categoryName =
    typeof raw.category === "object" && raw.category
      ? raw.category.name
      : typeof raw.category === "string"
        ? raw.category
        : "Uncategorized";
  const categoryId =
    typeof raw.category === "object" && raw.category ? raw.category.id : undefined;
  const categorySlug =
    typeof raw.category === "object" && raw.category ? raw.category.slug : undefined;

  const subcategoryName =
    typeof raw.subcategory === "object" && raw.subcategory
      ? raw.subcategory.name
      : typeof raw.subcategory === "string"
        ? raw.subcategory
        : undefined;
  const subcategoryId =
    typeof raw.subcategory === "object" && raw.subcategory
      ? raw.subcategory.id
      : undefined;
  const subcategorySlug =
    typeof raw.subcategory === "object" && raw.subcategory
      ? raw.subcategory.slug
      : undefined;

  const effectiveStock = raw.isOutOfStockManual ? 0 : Number(raw.stock ?? 0);

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description || "",
    price: sellingPrice,
    originalPrice: hasDiscount && basePrice > sellingPrice ? basePrice : undefined,
    discountPercent,
    category: categoryName,
    categoryId,
    categorySlug,
    subcategory: subcategoryName,
    subcategoryId,
    subcategorySlug,
    brand: raw.brand ?? null,
    rating: computedRating,
    reviewCount: computedReviewCount,
    images,
    stock: effectiveStock,
    isOutOfStockManual: Boolean(raw.isOutOfStockManual),
    isFeatured: Boolean(raw.isFeatured),
    tags: raw.tags,
    reviews,
  };
}

function mapCategory(raw: CategoryItem): CategoryItem {
  return {
    ...raw,
    image: raw.image ? resolveAssetUrl(raw.image) : null,
    subcategories: Array.isArray(raw.subcategories) ? raw.subcategories : [],
  };
}

export const productService = {
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<RawApiProduct[]>>("/products", {
      params: {
        limit: params?.limit ?? 100,
        page: params?.page ?? 1,
        search: params?.search || undefined,
        category: params?.category || undefined,
        subcategory: params?.subcategory || undefined,
        minPrice: params?.minPrice,
        maxPrice: params?.maxPrice,
        sort: params?.sort,
      },
    });
    const list = Array.isArray(response.data.data) ? response.data.data : [];
    return list.map(mapApiProduct);
  },

  async getProductsPaginated(params?: ProductFilterParams): Promise<{
    products: Product[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const response = await apiClient.get<ApiResponse<RawApiProduct[]>>("/products", {
      params,
    });
    const list = Array.isArray(response.data.data) ? response.data.data : [];
    return {
      products: list.map(mapApiProduct),
      meta: {
        total: response.data.meta?.total ?? list.length,
        page: response.data.meta?.page ?? 1,
        limit: response.data.meta?.limit ?? 12,
        totalPages: response.data.meta?.totalPages ?? 1,
      },
    };
  },

  async getProductById(idOrSlug: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<ApiResponse<RawApiProduct>>(
        `/products/${encodeURIComponent(idOrSlug)}`
      );
      if (!response.data?.data) return null;
      return mapApiProduct(response.data.data);
    } catch {
      return null;
    }
  },

  async getCategories(): Promise<CategoryItem[]> {
    const response = await apiClient.get<ApiResponse<CategoryItem[]>>("/categories");
    const list = Array.isArray(response.data.data) ? response.data.data : [];
    return list.map(mapCategory);
  },

  async getCategoryById(id: string): Promise<CategoryItem> {
    const response = await apiClient.get<ApiResponse<CategoryItem>>(
      `/categories/${encodeURIComponent(id)}`
    );
    return mapCategory(response.data.data);
  },

  async createCategory(payload: {
    name: string;
    slug: string;
    image?: string;
    imageFile?: File | null;
    description?: string;
  }): Promise<CategoryItem> {
    if (payload.imageFile) {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("slug", payload.slug);
      if (payload.description) formData.append("description", payload.description);
      formData.append("image", payload.imageFile);
      const response = await apiClient.post<ApiResponse<CategoryItem>>(
        "/categories",
        formData
      );
      return mapCategory(response.data.data);
    }
    const response = await apiClient.post<ApiResponse<CategoryItem>>("/categories", {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      image: payload.image,
    });
    return mapCategory(response.data.data);
  },

  async updateCategory(
    id: string,
    payload: {
      name?: string;
      description?: string;
      image?: string;
      imageFile?: File | null;
    }
  ): Promise<CategoryItem> {
    if (payload.imageFile) {
      const formData = new FormData();
      if (payload.name !== undefined) formData.append("name", payload.name);
      if (payload.description !== undefined) {
        formData.append("description", payload.description);
      }
      formData.append("image", payload.imageFile);
      const response = await apiClient.put<ApiResponse<CategoryItem>>(
        `/categories/${encodeURIComponent(id)}`,
        formData
      );
      return mapCategory(response.data.data);
    }
    const response = await apiClient.put<ApiResponse<CategoryItem>>(
      `/categories/${encodeURIComponent(id)}`,
      {
        name: payload.name,
        description: payload.description,
        image: payload.image,
      }
    );
    return mapCategory(response.data.data);
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${encodeURIComponent(id)}`);
  },

  async createSubcategory(payload: {
    categoryId: string;
    name: string;
    slug: string;
  }): Promise<SubcategoryItem> {
    const response = await apiClient.post<ApiResponse<SubcategoryItem>>(
      "/subcategories",
      payload
    );
    return response.data.data;
  },

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const files = payload.imageFiles ?? [];
    const urls =
      payload.imageUrls ??
      payload.images?.map((img) => img.url).filter(Boolean) ??
      [];

    if (files.length > 0) {
      const formData = buildProductFormData(payload);
      const response = await apiClient.post<ApiResponse<RawApiProduct>>(
        "/admin/products",
        formData
      );
      return mapApiProduct(response.data.data);
    }

    const response = await apiClient.post<ApiResponse<RawApiProduct>>(
      "/admin/products",
      {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        price: payload.price,
        discountPercent: payload.discountPercent,
        stock: payload.stock,
        categoryId: payload.categoryId,
        subcategoryId: payload.subcategoryId,
        brand: payload.brand,
        isFeatured: payload.isFeatured,
        imageUrls: parseImageUrlList(urls),
      }
    );
    return mapApiProduct(response.data.data);
  },

  async updateProduct(
    id: string,
    payload: Partial<CreateProductPayload>
  ): Promise<Product> {
    const files = payload.imageFiles ?? [];
    const urls =
      payload.imageUrls ??
      payload.images?.map((img) => img.url).filter(Boolean) ??
      [];

    if (files.length > 0) {
      const formData = buildProductFormData(payload);
      const response = await apiClient.put<ApiResponse<RawApiProduct>>(
        `/admin/products/${encodeURIComponent(id)}`,
        formData
      );
      return mapApiProduct(response.data.data);
    }

    const body: Record<string, unknown> = {
      name: payload.name,
      description: payload.description,
      price: payload.price,
      discountPercent: payload.discountPercent,
      stock: payload.stock,
      categoryId: payload.categoryId,
      subcategoryId: payload.subcategoryId,
      brand: payload.brand,
      isFeatured: payload.isFeatured,
    };
    const parsedUrls = parseImageUrlList(urls);
    if (parsedUrls.length > 0) body.imageUrls = parsedUrls;

    const response = await apiClient.put<ApiResponse<RawApiProduct>>(
      `/admin/products/${encodeURIComponent(id)}`,
      body
    );
    return mapApiProduct(response.data.data);
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/admin/products/${encodeURIComponent(id)}`);
  },

  async toggleOutOfStock(
    id: string,
    isOutOfStockManual: boolean
  ): Promise<{ id: string; isOutOfStockManual: boolean }> {
    const response = await apiClient.patch<
      ApiResponse<{ id: string; isOutOfStockManual: boolean }>
    >(`/admin/products/${encodeURIComponent(id)}/out-of-stock`, {
      isOutOfStockManual,
    });
    return response.data.data;
  },
};
