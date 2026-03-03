import Link from "next/link";
import { StepsBar } from "@/app/components/steps-bar";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Success",
  description: "Your portfolio order is confirmed. We'll create your portfolio in 6 hours.",
  robots: { index: false, follow: true },
};


export default function SuccessPage() {
  return (
    <div className="min-h-full flex-1 flex flex-col items-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-4 sm:py-6 md:py-8">
      <StepsBar currentStep={4} />
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md w-full py-8">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3">You&apos;re all set!</h1>
        <p className="text-slate-400 mb-2">
          Payment successful. We&apos;re creating your portfolio now.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          You&apos;ll receive it ASAP. Check your email for updates.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-medium transition"
        >
          Back to home
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
