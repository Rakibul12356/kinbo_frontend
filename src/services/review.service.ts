import apiClient, { resolveAssetUrl } from "@/lib/axios";
import type { ApiResponse, ProductReviewItem } from "@/types/ecommerce";

export interface SubmitReviewPayload {
  orderId: string;
  productId: string;
  rating: number;
  comment: string;
}

export const reviewService = {
  async submitReview(payload: SubmitReviewPayload): Promise<string> {
    const response = await apiClient.post<ApiResponse<null>>("/reviews", payload);
    return (
      response.data.message ||
      "Review submitted successfully and is pending admin approval."
    );
  },

  async getProductReviews(productId: string): Promise<ProductReviewItem[]> {
    const response = await apiClient.get<ApiResponse<ProductReviewItem[]>>(
      `/products/${encodeURIComponent(productId)}/reviews`
    );
    const items = Array.isArray(response.data.data) ? response.data.data : [];
    return items.map((r) => ({
      ...r,
      user: {
        name: r.user?.name || "Customer",
        avatar: r.user?.avatar ? resolveAssetUrl(r.user.avatar) : null,
      },
    }));
  },

  async getAdminReviews(): Promise<ProductReviewItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<ProductReviewItem[]>>(
        "/admin/reviews"
      );
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch {
      return [];
    }
  },

  async publishReview(id: string): Promise<string> {
    const response = await apiClient.patch<ApiResponse<null>>(
      `/admin/reviews/${encodeURIComponent(id)}/publish`
    );
    return response.data.message || "Review published successfully";
  },
};
