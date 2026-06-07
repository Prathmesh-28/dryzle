import { api } from './api';

export async function sendOtp(phone: string) {
  return api.post('/auth/otp/send', { phone });
}

export async function verifyOtp(phone: string, code: string) {
  const res = await api.post('/auth/otp/verify', { phone, code, role: 'VENDOR' });
  const { accessToken, refreshToken, user } = res.data;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.clear();
  window.location.href = '/login';
}
