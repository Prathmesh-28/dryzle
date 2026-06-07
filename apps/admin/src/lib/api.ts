import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getOrders: (params?: Record<string, unknown>) => api.get('/admin/orders', { params }),
  getUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  getVendors: (params?: Record<string, unknown>) => api.get('/admin/vendors', { params }),
  getDeliveryBoys: (params?: Record<string, unknown>) => api.get('/admin/delivery-boys', { params }),
  approveVendor: (id: string) => api.patch(`/admin/vendors/${id}/approve`),
  suspendVendor: (id: string) => api.patch(`/admin/vendors/${id}/suspend`),
  approveDeliveryBoy: (id: string) => api.patch(`/admin/delivery-boys/${id}/approve`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: Record<string, unknown>) => api.patch('/admin/settings', data),
  broadcast: (data: { title: string; body: string; role?: string }) =>
    api.post('/admin/notifications/broadcast', data),
};
