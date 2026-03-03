"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StepsBar } from "@/app/components/steps-bar";
import { API } from "@/lib/api-paths";

interface Portfolio {
  _id: string;
  name: string;
  email: string;
  collegeName?: string;
  template: string;
  paymentStatus: string;
  amount?: number;
  hasResume?: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.error) return;
        if (!d?.portfolio) {
          router.replace("/portfolio/create");
          return;
        }
        setPortfolio(d.portfolio);
      })
      .catch(() => setPortfolio(null))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || portfolio === undefined) {
    return (
      <div className="min-h-full flex-1 flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <div className="animate-spin w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  const isPaid = portfolio.paymentStatus === "completed";
  const statusLabel = isPaid ? "Completed" : "Pending";
  const statusColor = isPaid ? "text-green-400" : "text-amber-400";

  return (
    <div className="min-h-full flex-1 flex flex-col items-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-4 sm:py-6 md:py-8">
      <StepsBar currentStep={4} />
      <div className="w-full max-w-md flex-1 flex flex-col py-4">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Your Profile</h1>
          <p className="text-slate-400 text-sm mb-6">Status & details you submitted</p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-slate-400 text-sm">Status</span>
              <span className={`font-semibold ${statusColor}`}>{statusLabel}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-slate-400 text-sm">Name</span>
              <span className="text-white font-medium">{portfolio.name || "—"}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-slate-400 text-sm">Email</span>
              <span className="text-white font-medium truncate max-w-[180px]">{portfolio.email || "—"}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-slate-400 text-sm">College</span>
              <span className="text-white font-medium">{portfolio.collegeName || "—"}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-slate-400 text-sm">Template</span>
              <span className="text-white font-medium capitalize">{portfolio.template || "—"}</span>
            </div>
            {portfolio.amount != null && (
              <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                <span className="text-slate-400 text-sm">Amount</span>
                <span className="text-white font-medium">₹{portfolio.amount}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-slate-400 text-sm">Resume</span>
              <span className={portfolio.hasResume ? "text-green-400 font-medium" : "text-slate-500"}>
                {portfolio.hasResume ? "Uploaded" : "—"}
              </span>
            </div>
          </div>

          {isPaid && (
            <p className="text-slate-500 text-sm mb-6">
              Your portfolio is being created. You&apos;ll receive it ASAP.
            </p>
          )}

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
          >
            Back to home
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
