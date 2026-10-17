"use client";

import { useEffect } from "react";

/**
 * Client-side fallback auth guard for admin pages.
 * When the /api/admin-auth cookie route is unavailable (e.g. cold start on Netlify),
 * we fall back to a sessionStorage flag set during login.
 * This component sets a document cookie from client side as a last resort.
 */
export default function AdminAuthGuard() {
  useEffect(() => {
    try {
      const flag = sessionStorage.getItem("admin_fallback_auth");
      if (flag === "adminootd_authenticated") {
        // Set a JS-accessible cookie as backup signal
        document.cookie = "admin_fallback=1; path=/; max-age=86400; samesite=lax";
      }
    } catch {
      // sessionStorage not available
    }
  }, []);

  return null;
}
