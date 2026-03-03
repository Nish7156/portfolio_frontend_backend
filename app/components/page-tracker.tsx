"use client";

import { usePathname } from "next/navigation";
import { usePageTrack } from "./analytics-provider";

const PAGE_STEP: Record<string, number> = {
  "/": 0,
  "/register": 1,
  "/portfolio/create": 2,
  "/portfolio/pay": 3,
  "/success": 4,
  "/profile": 4,
};

export function PageTracker() {
  const pathname = usePathname();
  const page = pathname || "/";
  const enabled = page !== "/admin";
  const step = PAGE_STEP[page] ?? 0;
  usePageTrack(page, step, enabled);
  return null;
}
