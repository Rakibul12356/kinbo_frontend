import apiClient, { resolveAssetUrl } from "@/lib/axios";
import type { ApiResponse, CartItem } from "@/types/ecommerce";

interface RawCartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPercent?: number;
  finalPrice?: number;
  stock: number;
  isOutOfStock?: boolean;
  image?: string | { url?: string } | null;
  images?: Array<string | { url?: string; isPrimary?: boolean }>;
  thumbnail?: string;
}

interface RawCartItem {
  id: string;
  productId: string;
  quantity: number;
  product: RawCartProduct;
  itemTotal: number;
}

interface RawCartResponse {
  id: string;
  totalItems: number;
  subtotal: number;
  items: RawCartItem[];
}

function pickCartProductImage(product: RawCartProduct): string {
  // Prefer images[] (matches product catalog); single `image` is often stale/missing.
  const list = Array.isArray(product.images) ? product.images : [];
  if (list.length > 0) {
    const primary =
      list.find(
        (img) => typeof img === "object" && img && "isPrimary" in img && img.isPrimary
      ) ?? list[0];
    const fromList = resolveAssetUrl(primary);
    if (fromList) return fromList;
  }

  const fromField = resolveAssetUrl(product.image);
  if (fromField) return fromField;

  return resolveAssetUrl(product.thumbnail);
}

function mapCartItem(raw: RawCartItem): CartItem {
  const basePrice = Number(raw.product.price ?? 0);
  const finalPrice = Number(raw.product.finalPrice ?? basePrice);
  const discountPercent = Number(raw.product.discountPercent ?? 0);
  const imageUrl = pickCartProductImage(raw.product);

  return {
    itemId: raw.id,
    quantity: raw.quantity,
    product: {
      id: raw.product.id || raw.productId,
      name: raw.product.name,
      slug: raw.product.slug,
      description: "",
      price: finalPrice,
      originalPrice: basePrice > finalPrice ? basePrice : undefined,
      discountPercent,
      category: "",
      rating: 0,
      reviewCount: 0,
      images: imageUrl ? [imageUrl] : [],
      stock: raw.product.isOutOfStock ? 0 : Number(raw.product.stock ?? 0),
    },
  };
}

export const cartService = {
  async getCart(): Promise<{
    items: CartItem[];
    totalItems: number;
    subtotal: number;
  }> {
    const response = await apiClient.get<ApiResponse<RawCartResponse>>("/cart");
    const data = response.data.data;
    const rawItems = Array.isArray(data?.items) ? data.items : [];
    return {
      items: rawItems.map(mapCartItem),
      totalItems: Number(data?.totalItems ?? 0),
      subtotal: Number(data?.subtotal ?? 0),
    };
  },

  async addItem(productId: string, quantity = 1): Promise<void> {
    await apiClient.post("/cart/items", { productId, quantity });
  },

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    await apiClient.put(`/cart/items/${encodeURIComponent(itemId)}`, {
      quantity,
    });
  },

  async removeItem(itemId: string): Promise<void> {
    await apiClient.delete(`/cart/items/${encodeURIComponent(itemId)}`);
  },

  async clearCart(): Promise<void> {
    await apiClient.delete("/cart");
  },
};
