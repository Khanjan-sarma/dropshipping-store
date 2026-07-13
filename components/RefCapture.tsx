"use client";

import { useEffect } from "react";

// Captures ?ref= / utm_source on landing and stores it in a cookie for
// 30 days as a second attribution signal (Section 7). Saved onto the order
// at checkout.
export function RefCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref") || params.get("utm_source");
      if (ref) {
        const value = encodeURIComponent(ref.slice(0, 120));
        document.cookie = `ss_ref=${value}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      }
    } catch {
      // ignore
    }
  }, []);
  return null;
}

export function readRefCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)ss_ref=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}
