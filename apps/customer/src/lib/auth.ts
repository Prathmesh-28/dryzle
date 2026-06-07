import { api } from './api';

export async function sendOtp(phone: string) {
  return api.post('/auth/otp/send', { phone });
}

export async function verifyOtp(phone: string, code: string, name?: string) {
  const res = await api.post('/auth/otp/verify', {
    phone,
    code,
    role: 'CUSTOMER',
    name: name ?? 'Customer',
  });
  const { accessToken, refreshToken, user } = res.data;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
  return user;
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.clear();
  window.location.href = '/login';
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
}
