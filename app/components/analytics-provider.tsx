"use client";

import { useEffect, useRef } from "react";
import { API } from "@/lib/api-paths";

const STORAGE_KEY = "portfolio_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

function track(
  page: string,
  action: string,
  opts?: { step?: number; timeSpentMs?: number }
) {
  const sessionId = getSessionId();
  const token = typeof window !== "undefined" ? localStorage.getItem("portfolio_token") : null;
  fetch(API._k, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      sessionId,
      page,
      action,
      step: opts?.step,
      timeSpentMs: opts?.timeSpentMs,
    }),
  }).catch(() => {});
}

export function usePageTrack(page: string, step?: number, enabled = true) {
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    if (!enabled || page === "/admin") return;
    track(page, "page_view", { step });
    return () => {
      if (!enabled || page === "/admin") return;
      const timeSpent = Date.now() - mountedAt.current;
      track(page, "page_leave", { step, timeSpentMs: timeSpent });
    };
  }, [page, step, enabled]);
}

export function trackStepComplete(page: string, step: number) {
  track(page, "step_complete", { step });
}
