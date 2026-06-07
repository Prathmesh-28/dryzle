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

export const customerApi = {
  getNearbyVendors: (lat: number, lng: number) =>
    api.get('/vendors/nearby', { params: { lat, lng } }),
  getVendor: (id: string) => api.get(`/vendors/${id}`),
  validatePromo: (code: string, subtotal: number) =>
    api.post('/promos/validate', { code, subtotal }),
  createOrder: (data: Record<string, unknown>) => api.post('/orders', data),
  getOrders: (page = 1) => api.get('/orders', { params: { page } }),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  cancelOrder: (id: string, reason?: string) =>
    api.patch(`/orders/${id}/cancel`, { reason }),
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/me', data),
  getAddresses: () => api.get('/users/me/addresses'),
  addAddress: (data: Record<string, unknown>) => api.post('/users/me/addresses', data),
  getNotifications: () => api.get('/notifications'),
  initiatePayment: (orderId: string, method: string) =>
    api.post('/payments/initiate', { orderId, method }),
  submitReview: (data: { orderId: string; rating: number; comment?: string }) =>
    api.post('/reviews', data),
};
