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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://portfoliogen.in";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "PortfolioGen | Resume to Portfolio in Minutes — ₹50 | Students & Professionals",
    template: "%s | PortfolioGen",
  },
  description:
    "Create your professional portfolio website from your resume in minutes. Register with OTP, upload PDF, pay ₹50 or ₹100. Beautiful design delivered in 6 hours. Trusted by students across India for placements & internships.",
  keywords: [
    "portfolio website",
    "resume to portfolio",
    "create portfolio online",
    "student portfolio",
    "professional portfolio",
    "portfolio builder India",
    "placement portfolio",
    "resume to website",
    "portfolio generator",
  ],
  authors: [{ name: "PortfolioGen", url: baseUrl }],
  creator: "PortfolioGen",
  publisher: "PortfolioGen",
  applicationName: "PortfolioGen",
  category: "technology",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    siteName: "PortfolioGen",
    title: "PortfolioGen | Resume to Portfolio in Minutes — ₹50",
    description: "Create your professional portfolio from resume. Register with OTP, add details, pay ₹50 or ₹100. Beautiful design in 6 hours. Trusted by students.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "PortfolioGen - Resume to Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PortfolioGen | Resume to Portfolio — ₹50",
    description: "Create your professional portfolio from resume. ₹50 basic, ₹100 premium. Trusted by students.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: baseUrl,
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  }),
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#312e81",
  width: "device-width",
  initialScale: 1,
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
