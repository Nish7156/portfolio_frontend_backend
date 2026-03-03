"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { StepsBar } from "@/app/components/steps-bar";
import { API } from "@/lib/api-paths";

const REGISTER_KEY = "portfolio_register";

export default function RegisterPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [checking, setChecking] = useState(true);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("portfolio_token");
    if (!token) {
      setChecking(false);
      return;
    }
    fetch(API._c, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem("portfolio_token");
          setChecking(false);
          return;
        }
        return r.json();
      })
      .then((d) => {
        setChecking(false);
        if (!d || d.error) return;
        if (!d.portfolio) {
          router.replace("/portfolio/create");
          return;
        }
        if (d.portfolio.paymentStatus === "completed") {
          router.replace("/profile");
          return;
        }
        router.replace("/portfolio/pay");
      })
      .catch(() => setChecking(false));
  }, [router]);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem(REGISTER_KEY);
      if (s) {
        const d = JSON.parse(s);
        if (d.phone) setPhone(d.phone);
        if (d.step === "otp") setStep("otp");
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(REGISTER_KEY, JSON.stringify({ phone, step }));
    } catch {}
  }, [phone, step]);

  useEffect(() => {
    if (step === "otp") {
      setResendIn(60);
      otpInputRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const sendOTP = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(API._a, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStep("otp");
      setResendIn(60);
      otpInputRef.current?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(API._b, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");
      localStorage.setItem("portfolio_token", data.token);
      try {
        sessionStorage.removeItem(REGISTER_KEY);
      } catch {}
      router.push("/portfolio/create");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") action();
  };

  if (checking) {
    return (
      <div className="min-h-full flex-1 flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <div className="text-slate-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex-1 flex flex-col items-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-4 sm:py-6 md:py-8">
      <StepsBar currentStep={1} />
      <div className="w-full max-w-md flex-1 flex flex-col justify-center py-4">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Create your portfolio</h1>
          <p className="text-slate-400 text-sm mb-6">Verify your phone to get started — no password needed</p>

          {step === "phone" ? (
            <>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mobile number</label>
              <div className="flex rounded-xl overflow-hidden border border-slate-600 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 transition mb-4">
                <span className="flex items-center px-4 bg-slate-800/80 text-slate-400 text-sm border-r border-slate-600">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onKeyDown={(e) => handleKeyDown(e, sendOTP)}
                  placeholder="9876543210"
                  maxLength={10}
                  className="input-base border-0 rounded-none focus:ring-0 flex-1"
                  autoComplete="tel-national"
                />
              </div>
              <p className="text-slate-500 text-xs mb-4">
                Enter your 10-digit mobile number. We&apos;ll send a one-time code.
              </p>
            </>
          ) : (
            <>
              <p className="text-slate-400 text-sm mb-3">
                Code sent to <span className="text-white font-medium">+91 {phone}</span>
                <button
                  onClick={() => setStep("phone")}
                  className="ml-2 text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                >
                  Change
                </button>
              </p>
              <label className="block text-sm font-medium text-slate-300 mb-2">Enter OTP</label>
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => handleKeyDown(e, verifyOTP)}
                placeholder="000000"
                maxLength={6}
                className="input-base input-focus text-center text-xl sm:text-2xl tracking-[0.25em] sm:tracking-[0.5em] mb-4"
                autoComplete="one-time-code"
              />
              {resendIn > 0 ? (
                <p className="text-slate-500 text-sm mb-4">Resend code in {resendIn}s</p>
              ) : (
                <button
                  onClick={sendOTP}
                  disabled={loading}
                  className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 underline underline-offset-2"
                >
                  Resend OTP
                </button>
              )}
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            onClick={step === "phone" ? sendOTP : verifyOTP}
            disabled={loading || (step === "phone" ? phone.length !== 10 : otp.length !== 6)}
            className="btn-primary"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Please wait...
              </span>
            ) : step === "phone" ? (
              "Send OTP"
            ) : (
              "Verify & Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
