'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendOtp, verifyOtp } from '@/lib/auth';

export default function DeliveryLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await sendOtp(phone); setStep('otp'); }
    catch { setError('Failed to send OTP.'); }
    finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await verifyOtp(phone, code);
      if (user.role !== 'DELIVERY_BOY') { setError('Delivery partner accounts only.'); return; }
      router.push('/orders');
    } catch { setError('Invalid OTP.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl">🚴</span>
          </div>
          <h1 className="text-xl font-bold">Delivery Partner Login</h1>
        </div>
        {step === 'phone' ? (
          <form onSubmit={handleSend} className="space-y-4">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+919876543210" type="tel"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
              {loading ? 'Sending…' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} placeholder="• • • • • •"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
              {loading ? 'Verifying…' : 'Verify'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
