import Link from "next/link";
import Image from "next/image";
import { RedirectIfLoggedIn } from "@/app/components/redirect-if-logged-in";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://portfoliogen.in";

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PortfolioGen",
    url: baseUrl,
    description: "Create your professional portfolio website from your resume in minutes. ₹50 or ₹100. Delivered in 6 hours.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/register` },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "PortfolioGen",
    description: "Create your professional portfolio website from your resume. Beautiful design delivered in max 6 hours. Register with OTP, add details, pay ₹50 or ₹100.",
    url: baseUrl,
    provider: { "@type": "Organization", name: "PortfolioGen", url: baseUrl },
    areaServed: { "@type": "Country", name: "India" },
    offers: [
      { "@type": "Offer", price: "50", priceCurrency: "INR", name: "Basic Template" },
      { "@type": "Offer", price: "100", priceCurrency: "INR", name: "Premium Template" },
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-full flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-32 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 rounded-full bg-indigo-400/5 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>
      <RedirectIfLoggedIn />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur relative safe-area-top">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center min-h-[44px] sm:min-h-0">
          <Link href="/" className="flex items-center gap-2 py-2 -my-2 transition hover:opacity-90">
            <Image src="/logo.png" alt="PortfolioGen" width={176} height={96} className="h-8 w-auto sm:h-9" priority />
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-5 sm:px-6 pt-6 sm:pt-12 md:pt-20 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] sm:pb-24 overflow-x-hidden relative z-10">
        <div className="text-center max-w-3xl mx-auto px-1 sm:px-2">
          <p className="text-indigo-400/90 text-xs sm:text-sm font-medium mb-2 sm:mb-4 uppercase tracking-wider animate-fade-in-up opacity-0" style={{ animationDelay: "0.05s", animationFillMode: "forwards" }}>
            Placements. Internships. You vs 500 PDFs.
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-snug sm:leading-tight mb-3 sm:mb-5 animate-fade-in-up opacity-0" style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}>
            Stand out when{" "}
            <span className="animate-color-emphasize">
              everyone looks the same.
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-400 mb-2 sm:mb-2 leading-relaxed animate-fade-in-up opacity-0" style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}>
            Recruiters spend 7 seconds on a resume. Give them a link. One link that says you&apos;re not just another PDF.
          </p>
          <p className="text-slate-500 text-xs sm:text-base mb-3 sm:mb-5 animate-fade-in-up opacity-0" style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}>
            ₹50 — less than 2 coffees. Your batchmates might already have one.
          </p>
          <p className="text-indigo-400/80 text-xs sm:text-sm font-medium mb-5 sm:mb-8 animate-fade-in-up opacity-0 leading-relaxed" style={{ animationDelay: "0.45s", animationFillMode: "forwards" }}>
            Beautiful portfolio with proper design — delivered in max 6 hours.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-400/70 bg-indigo-600 px-4 py-2 font-semibold text-white text-sm transition-all duration-300 hover:bg-indigo-500 hover:border-indigo-300 hover:scale-[1.02] active:scale-[0.98] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm touch-manipulation"
          >
            Create my portfolio — 5 mins
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="mt-8 sm:mt-24 md:mt-28 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900/50 border border-slate-700/50 hover:border-indigo-500/40 active:scale-[0.99] sm:hover:scale-[1.02] sm:hover:-translate-y-1 sm:hover:shadow-lg sm:hover:shadow-indigo-500/10 transition-all duration-300 group animate-fade-in-up opacity-0 touch-manipulation" style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-indigo-500/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:animate-float transition">
              <span className="text-xl sm:text-2xl">📱</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">1. OTP — no passwords</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">Phone number. Code. Done. Faster than filling another form.</p>
          </div>
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900/50 border border-slate-700/50 hover:border-indigo-500/40 active:scale-[0.99] sm:hover:scale-[1.02] sm:hover:-translate-y-1 sm:hover:shadow-lg sm:hover:shadow-indigo-500/10 transition-all duration-300 group animate-fade-in-up opacity-0 touch-manipulation" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-indigo-500/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:animate-float transition">
              <span className="text-xl sm:text-2xl">📄</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">2. Drop your resume</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">Name + PDF. We turn it into a site. No coding. No waiting.</p>
          </div>
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900/50 border border-slate-700/50 hover:border-indigo-500/40 active:scale-[0.99] sm:hover:scale-[1.02] sm:hover:-translate-y-1 sm:hover:shadow-lg sm:hover:shadow-indigo-500/10 transition-all duration-300 group animate-fade-in-up opacity-0 touch-manipulation" style={{ animationDelay: "0.95s", animationFillMode: "forwards" }}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-indigo-500/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:animate-float transition">
              <span className="text-xl sm:text-2xl">✨</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">3. Share the link</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">₹50 or ₹100. Beautiful portfolio ready in max 6 hrs — proper design, fully done. Drop it in applications.</p>
          </div>
        </div>

        <p className="mt-6 sm:mt-16 text-center text-slate-500 text-xs sm:text-sm max-w-xl mx-auto animate-fade-in opacity-0 px-2" style={{ animationDelay: "1.1s", animationFillMode: "forwards" }}>
          Beautiful portfolio with proper design — delivered within 6 hours. Trusted by students across India. Secure payment via Razorpay.
        </p>
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-slate-500 text-xs sm:text-sm animate-fade-in opacity-0" style={{ animationDelay: "1.1s", animationFillMode: "forwards" }}>
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure payments
          </span>
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Razorpay
          </span>
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            No hidden fees
          </span>
        </div>
      </main>
    </div>
  );
}
