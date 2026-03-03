"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepsBar } from "@/app/components/steps-bar";
import { API } from "@/lib/api-paths";

const PAY_KEY = "portfolio_pay_template";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
}

interface RazorpayInstance {
  open: () => void;
}

export default function PayPage() {
  const [template, setTemplate] = useState<"basic" | "premium">("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    try {
      const s = sessionStorage.getItem(PAY_KEY);
      if (s === "premium") setTemplate("premium");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(PAY_KEY, template);
    } catch {}
  }, [template]);

  useEffect(() => {
    const t = localStorage.getItem("portfolio_token");
    if (!t) {
      router.push("/register");
      return;
    }
    fetch(API._c, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem("portfolio_token");
          router.push("/register");
          return;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.portfolio?.paymentStatus === "completed") {
          router.replace("/success");
        }
      });
  }, [router]);

  const initiatePayment = async () => {
    setError("");
    setLoading(true);
    const token = localStorage.getItem("portfolio_token");
    if (!token) {
      router.push("/register");
      return;
    }
    try {
      const res = await fetch(API._e, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ template }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      if (!window.Razorpay) {
        setError("Payment script not loaded. Please refresh.");
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount * 100,
        currency: "INR",
        name: "PortfolioGen",
        order_id: data.orderId,
        handler: async (response) => {
          const vRes = await fetch(API._h, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const vData = await vRes.json();
          if (vRes.ok && vData.success) {
            try { sessionStorage.removeItem(PAY_KEY); } catch {}
            router.push("/success");
            router.refresh();
          } else {
            setError("Payment verification failed");
          }
        },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex-1 flex flex-col items-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-4 sm:py-6 md:py-8">
      <StepsBar currentStep={3} />
      <div className="w-full max-w-md flex-1 flex flex-col justify-center py-4">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Choose your template</h1>
          <p className="text-slate-400 text-sm mb-6">One-time payment. Portfolio created ASAP.</p>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => setTemplate("basic")}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                template === "basic"
                  ? "border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/10"
                  : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/30 flex items-center justify-center shrink-0">
                    <span className="text-lg">📄</span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-white block">Basic Template</span>
                    <span className="text-slate-400 text-sm">Clean & professional</span>
                  </div>
                </div>
                <span className="text-xl font-bold text-indigo-400 shrink-0">₹50</span>
              </div>
            </button>
            <button
              onClick={() => setTemplate("premium")}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                template === "premium"
                  ? "border-amber-500/70 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                  : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                    <span className="text-lg">✨</span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-white block">Premium Template</span>
                    <span className="text-slate-400 text-sm">Advanced design, more sections</span>
                  </div>
                </div>
                <span className="text-xl font-bold text-amber-400 shrink-0">₹100</span>
              </div>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button onClick={initiatePayment} disabled={loading} className="btn-primary">
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Opening payment...
              </span>
            ) : (
              <span className="truncate">Pay ₹{template === "basic" ? "50" : "100"} & Create Portfolio</span>
            )}
          </button>

          <p className="text-slate-500 text-xs mt-4 text-center">Secure payment via Razorpay</p>
        </div>
      </div>
    </div>
  );
}
