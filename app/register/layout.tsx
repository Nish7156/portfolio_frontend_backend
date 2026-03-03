import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://portfoliogen.in";

export const metadata: Metadata = {
  title: "Register | Create Portfolio with OTP",
  description:
    "Register with your phone number. No passwords. Get OTP, add your resume, pay ₹50 or ₹100. Your portfolio delivered in 6 hours.",
  openGraph: {
    title: "Register | PortfolioGen",
    description: "Register with OTP. Add resume. Get your portfolio in 6 hours.",
    url: `${baseUrl}/register`,
  },
  alternates: { canonical: `${baseUrl}/register` },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
