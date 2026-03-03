import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  robots: { index: false, follow: true },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
