import axios from "axios";

/** Prefer same-origin `/api/v1` (Next rewrite → backend) so CORS does not block the browser. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "/api/v1"
).replace(/\/+$/, "");

export const STATIC_BASE_URL = (
  process.env.NEXT_PUBLIC_STATIC_URL ||
  process.env.BACKEND_URL ||
  "https://kinbo-backend.onrender.com"
).replace(/\/+$/, "");

export function resolveAssetUrl(path?: unknown): string {
  if (!path) return "";
  let str: string | undefined;
  if (typeof path === "string") {
    str = path;
  } else if (typeof path === "object") {
    const obj = path as Record<string, unknown>;
    const candidate = obj.url ?? obj.secure_url ?? obj.src ?? obj.path ?? obj.imageUrl;
    if (typeof candidate === "string") str = candidate;
  }
  if (!str) return "";
  if (
    str.startsWith("http://") ||
    str.startsWith("https://") ||
    str.startsWith("data:") ||
    str.startsWith("blob:")
  ) {
    return str;
  }
  // Relative paths (/uploads/...) → absolute static host (img tags work cross-origin).
  if (str.startsWith("/")) {
    return `${STATIC_BASE_URL}${str}`;
  }
  return str;
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
    // Let the browser set multipart boundary for FormData uploads.
    if (typeof FormData !== "undefined" && config.data instanceof FormData && config.headers) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
      } else {
        delete (config.headers as Record<string, unknown>)["Content-Type"];
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
