"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api-paths";

export function RedirectIfLoggedIn() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("portfolio_token") : null;
    if (!token) {
      setDone(true);
      return;
    }
    fetch(API._c, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem("portfolio_token");
          setDone(true);
          return;
        }
        return r.json();
      })
      .then((d) => {
        if (!d || d.error) {
          setDone(true);
          return;
        }
        if (!d.portfolio) {
          router.replace("/portfolio/create");
          return;
        }
        if (d.portfolio.paymentStatus === "completed") {
          router.replace("/success");
          return;
        }
        router.replace("/portfolio/pay");
      })
      .catch(() => setDone(true));
  }, [router]);

  return null;
}
