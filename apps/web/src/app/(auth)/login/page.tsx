"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { apiPost } from "@/lib/api";
import { saveAuth, roleHomePath, type AuthUser } from "@/lib/auth";

interface VerifyResp {
  token?: string;
  accessToken?: string;
  user?: AuthUser;
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const validPhone = /^[6-9]\d{9}$/.test(phone);

  const sendOtp = async () => {
    if (!validPhone) {
      toast.error("Enter a valid 10-digit Indian phone number");
      return;
    }
    setLoading(true);
    try {
      await apiPost("/auth/send-otp", { phone });
      toast.success("OTP sent");
      setStep("otp");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost<VerifyResp>("/auth/verify-otp", { phone, otp });
      const token = data.token || data.accessToken;
      if (!token) throw new Error("No token returned");
      const user = saveAuth(token, data.user);
      if (!user?.role) {
        toast.error("Could not determine your role");
        return;
      }
      // also set cookie for middleware
      document.cookie = `dryzle_token=${token};path=/;max-age=86400`;
      toast.success("Welcome to Dryzle");
      router.push(roleHomePath(user.role));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur mb-4 shadow-lg">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Dryzle</h1>
          <p className="mt-2 text-white/85">Laundry, at your door</p>
        </div>

        <div className="bg-card rounded-2xl shadow-2xl p-6 sm:p-8">
          {step === "phone" ? (
            <>
              <h2 className="text-xl font-semibold mb-1">Sign in</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We&apos;ll send a one-time code to your phone
              </p>
              <label className="text-sm font-medium">Phone number</label>
              <div className="mt-2 flex gap-2">
                <div className="flex items-center px-3 rounded-md border bg-muted text-sm font-medium">
                  +91
                </div>
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="text-base"
                  autoFocus
                />
              </div>
              <Button
                onClick={sendOtp}
                disabled={loading || !validPhone}
                className="w-full mt-6 h-12 text-base font-semibold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep("phone")}
                className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" /> Change number
              </button>
              <h2 className="text-xl font-semibold mb-1">Enter OTP</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Sent to +91 {phone}
              </p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full mt-6 h-12 text-base font-semibold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
              </Button>
              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full mt-3 text-sm text-primary hover:underline"
              >
                Resend OTP
              </button>
            </>
          )}
        </div>

        <p className="text-center text-white/70 text-xs mt-6">
          By continuing, you agree to Dryzle&apos;s Terms &amp; Privacy
        </p>
      </div>
    </div>
  );
}
