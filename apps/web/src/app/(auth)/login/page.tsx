'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { saveAuth, roleHomePath } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendOtp() {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/send-otp', { phone });
      setStep('otp');
    } catch {
      setError('Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ accessToken: string; user: { role: string } }>(
        '/auth/verify-otp',
        { phone, otp },
      );
      // Save token in cookie so middleware can read it
      document.cookie = `dryzle_token=${res.accessToken};path=/;max-age=86400`;
      saveAuth(res.accessToken, res.user as never);
      router.push(roleHomePath(res.user.role));
    } catch {
      setError('Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-indigo-600 mb-1">Dryzle</h1>
        <p className="text-gray-500 mb-6 text-sm">Laundry, at your door</p>

        {step === 'phone' ? (
          <>
            <label className="block text-sm font-medium mb-1">Phone number</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={sendOtp}
              disabled={loading || !phone}
              className="w-full bg-indigo-600 text-white rounded-lg py-2 font-semibold disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">OTP sent to {phone}</p>
            <label className="block text-sm font-medium mb-1">Enter OTP</label>
            <input
              type="text"
              maxLength={6}
              placeholder="------"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4 text-center tracking-widest text-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length < 4}
              className="w-full bg-indigo-600 text-white rounded-lg py-2 font-semibold disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Verify & Login'}
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full mt-2 text-sm text-indigo-500 underline"
            >
              Change number
            </button>
          </>
        )}
        {error && <p className="mt-3 text-red-500 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
