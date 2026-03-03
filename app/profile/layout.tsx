import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Profile",
  description: "View your portfolio status and submitted details.",
  robots: { index: false, follow: true },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
