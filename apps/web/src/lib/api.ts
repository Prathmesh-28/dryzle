import axios from "axios";
import { getToken, clearAuth } from "./auth";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://dryzle-api.onrender.com/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      clearAuth();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export const apiGet = <T = unknown>(path: string, params?: Record<string, unknown>) =>
  api.get<T>(path, { params }).then((r) => r.data);
export const apiPost = <T = unknown>(path: string, body?: unknown) =>
  api.post<T>(path, body).then((r) => r.data);
export const apiPatch = <T = unknown>(path: string, body?: unknown) =>
  api.patch<T>(path, body).then((r) => r.data);
export const apiDelete = <T = unknown>(path: string) =>
  api.delete<T>(path).then((r) => r.data);
