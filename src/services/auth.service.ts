import apiClient, { resolveAssetUrl } from "@/lib/axios";
import type { ApiResponse, UserProfile } from "@/types/ecommerce";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function mapUser(raw: UserProfile): UserProfile {
  return {
    ...raw,
    avatar: raw.avatar ? resolveAssetUrl(raw.avatar) : null,
  };
}

export const authService = {
  async register(
    payload: RegisterPayload
  ): Promise<{ token: string; user: UserProfile; message?: string }> {
    const response = await apiClient.post<ApiResponse<UserProfile>>(
      "/auth/register",
      payload
    );
    const token = response.data.token;
    if (!token) {
      throw new Error("Authentication token missing in server response.");
    }
    return {
      token,
      user: mapUser(response.data.data),
      message: response.data.message,
    };
  },

  async login(
    payload: LoginPayload
  ): Promise<{ token: string; user: UserProfile; message?: string }> {
    const response = await apiClient.post<ApiResponse<UserProfile>>(
      "/auth/login",
      payload
    );
    const token = response.data.token;
    if (!token) {
      throw new Error("Authentication token missing in server response.");
    }
    return {
      token,
      user: mapUser(response.data.data),
      message: response.data.message,
    };
  },

  async getMe(): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<UserProfile>>("/auth/me");
    return mapUser(response.data.data);
  },

  async updateProfile(formData: FormData): Promise<UserProfile> {
    // Try customer profile first, then auth profile (admin/shared).
    try {
      const response = await apiClient.put<ApiResponse<UserProfile>>(
        "/users/profile",
        formData
      );
      return mapUser(response.data.data);
    } catch {
      const response = await apiClient.put<ApiResponse<UserProfile>>(
        "/auth/profile",
        formData
      );
      return mapUser(response.data.data);
    }
  },

  async changePassword(payload: ChangePasswordPayload): Promise<string> {
    const response = await apiClient.put<ApiResponse<null>>(
      "/users/change-password",
      payload
    );
    return response.data.message || "Password changed successfully";
  },
};
