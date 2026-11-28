import apiClient, { resolveAssetUrl } from "@/lib/axios";
import type {
  ApiResponse,
  DeliveryArea,
  SavedAddress,
  StockAlertItem,
  WishlistItem,
} from "@/types/ecommerce";

export interface AddAddressPayload {
  customerName: string;
  phone: string;
  streetAddress: string;
  city: string;
  deliveryArea: DeliveryArea;
  isDefault?: boolean;
}

export const accountService = {
  async getAddresses(): Promise<SavedAddress[]> {
    const response = await apiClient.get<ApiResponse<SavedAddress[]>>("/addresses");
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async addAddress(payload: AddAddressPayload): Promise<SavedAddress> {
    const response = await apiClient.post<ApiResponse<SavedAddress>>(
      "/addresses",
      payload
    );
    return response.data.data;
  },

  async setDefaultAddress(id: string): Promise<void> {
    await apiClient.patch(`/addresses/${encodeURIComponent(id)}/default`);
  },

  async getWishlist(): Promise<WishlistItem[]> {
    const response = await apiClient.get<ApiResponse<WishlistItem[]>>("/wishlist");
    const items = Array.isArray(response.data.data) ? response.data.data : [];
    return items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        image: resolveAssetUrl(item.product?.image),
      },
    }));
  },

  async addToWishlist(productId: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<null>>(
      `/wishlist/${encodeURIComponent(productId)}`
    );
    return response.data.message || "Product added to wishlist";
  },

  async removeFromWishlist(productId: string): Promise<string> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/wishlist/${encodeURIComponent(productId)}`
    );
    return response.data.message || "Product removed from wishlist";
  },

  async getNotifiedProducts(): Promise<StockAlertItem[]> {
    const response = await apiClient.get<ApiResponse<StockAlertItem[]>>(
      "/notified-products"
    );
    const items = Array.isArray(response.data.data) ? response.data.data : [];
    return items.map((item) => {
      const firstImg =
        item.product?.image ??
        (Array.isArray(item.product?.images) && item.product.images[0]
          ? typeof item.product.images[0] === "string"
            ? item.product.images[0]
            : item.product.images[0].url
          : "");
      return {
        ...item,
        product: {
          ...item.product,
          image: resolveAssetUrl(firstImg),
        },
      };
    });
  },

  async subscribeStockAlert(productId: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<null>>(
      `/notified-products/${encodeURIComponent(productId)}`
    );
    return (
      response.data.message ||
      "You will be notified as soon as this item is back in stock"
    );
  },
};
