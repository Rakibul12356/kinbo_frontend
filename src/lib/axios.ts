import axios from "axios";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://kinbo-backend.onrender.com/api/v1"
).replace(/\/+$/, "");

export const STATIC_BASE_URL = (
  process.env.NEXT_PUBLIC_STATIC_URL || API_BASE_URL
).replace(/\/+$/, "");

export function resolveAssetUrl(path?: string | null): string {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  if (path.startsWith("/uploads")) {
    return `${STATIC_BASE_URL}${path}`;
  }
  return path;
}

export function extractApiError(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error.message) return error.message;
  } else if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// Request interceptor for injecting JWT access token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("kinbo-auth-unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
