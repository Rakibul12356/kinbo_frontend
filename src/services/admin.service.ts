import apiClient, { resolveAssetUrl } from "@/lib/axios";
import type {
  AdminAnalyticsOverview,
  AdminAnalyticsReports,
  AdminChartPoint,
  AdminCustomer,
  AdminCustomerDossier,
  ApiResponse,
} from "@/types/ecommerce";

export type ChartFilter = "7d" | "1m" | "3m" | "6m" | "12m";

export const adminService = {
  async getAnalyticsOverview(): Promise<AdminAnalyticsOverview> {
    const response = await apiClient.get<ApiResponse<AdminAnalyticsOverview>>(
      "/admin/analytics/overview"
    );
    return response.data.data;
  },

  async getAnalyticsCharts(filter: ChartFilter = "7d"): Promise<{
    filter: ChartFilter;
    data: AdminChartPoint[];
  }> {
    const response = await apiClient.get<
      ApiResponse<AdminChartPoint[]> & { filter?: ChartFilter }
    >("/admin/analytics/charts", {
      params: { filter },
    });
    return {
      filter: response.data.filter ?? filter,
      data: Array.isArray(response.data.data) ? response.data.data : [],
    };
  },

  async getAnalyticsReports(): Promise<AdminAnalyticsReports> {
    const response = await apiClient.get<ApiResponse<AdminAnalyticsReports>>(
      "/admin/analytics/reports"
    );
    return response.data.data;
  },

  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    customers: AdminCustomer[];
    meta: { total: number; page: number; limit: number };
  }> {
    const response = await apiClient.get<ApiResponse<AdminCustomer[]>>(
      "/admin/customers",
      { params }
    );
    const customers = Array.isArray(response.data.data) ? response.data.data : [];
    return {
      customers,
      meta: {
        total: response.data.meta?.total ?? customers.length,
        page: response.data.meta?.page ?? params?.page ?? 1,
        limit: response.data.meta?.limit ?? params?.limit ?? 10,
      },
    };
  },

  async getCustomerDossier(id: string): Promise<AdminCustomerDossier> {
    const response = await apiClient.get<ApiResponse<AdminCustomerDossier>>(
      `/admin/customers/${encodeURIComponent(id)}`
    );
    const data = response.data.data;
    return {
      ...data,
      profile: {
        ...data.profile,
        avatar: data.profile?.avatar ? resolveAssetUrl(data.profile.avatar) : null,
      },
    };
  },
};
