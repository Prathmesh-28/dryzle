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

export const vendorApi = {
  getOrders: (page = 1) => api.get('/orders', { params: { page } }),
  updateOrderStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/orders/${id}/status`, { status, notes }),
  getServices: () => api.get('/vendors/me/services'),
  addService: (data: Record<string, unknown>) => api.post('/vendors/me/services', data),
  updateVendor: (data: Record<string, unknown>) => api.put('/vendors/me', data),
  toggleOpen: () => api.patch('/vendors/me/toggle-open'),
  getProfile: () => api.get('/users/me'),
};
