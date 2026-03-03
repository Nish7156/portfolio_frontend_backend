import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { PageTracker } from "@/app/components/page-tracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PortfolioGen | Resume to Portfolio in Minutes — ₹50",
    template: "%s | PortfolioGen",
  },
  description:
    "Create your professional portfolio website from your resume. Register with OTP, add details, pay ₹50 or ₹100. Get your portfolio ASAP. Trusted by students and professionals.",
  keywords: [
    "portfolio website",
    "resume to portfolio",
    "create portfolio",
    "student portfolio",
    "professional portfolio",
    "portfolio builder India",
  ],
  authors: [{ name: "PortfolioGen" }],
  creator: "PortfolioGen",
  openGraph: {
    type: "website",
    title: "PortfolioGen | Resume to Portfolio — ₹50",
    description: "Create your professional portfolio from resume. Register, add details, pay. Get portfolio ASAP.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PortfolioGen | Resume to Portfolio",
    description: "Create your professional portfolio from resume. ₹50 basic, ₹100 premium.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: "#312e81",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}
      >
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        <PageTracker />
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="shrink-0 py-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center border-t border-slate-800/50 bg-slate-950/50">
          <a
            href="https://www.webtriggers.online/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-400 text-xs sm:text-sm transition"
          >
            Powered by Web Triggers
          </a>
        </footer>
      </body>
    </html>
  );
}
