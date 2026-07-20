"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Legacy Supabase recovery emails redirect with tokens in the URL hash
 * (#access_token=...&type=recovery). The server never sees the hash, so we
 * exchange it for a cookie session on the client before showing the form.
 */
export default function ResetPasswordHashHandler({
  onReady,
}: {
  onReady: () => void;
}) {
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function handleHash() {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;

      if (!hash) {
        onReady();
        return;
      }

      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (!accessToken || !refreshToken || type !== "recovery") {
        onReady();
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (cancelled) return;

      window.history.replaceState(null, "", window.location.pathname);

      if (sessionError) {
        setError("Your reset link is invalid or has expired. Please request a new one.");
        onReady();
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await fetch("/api/auth/complete-recovery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "recovery",
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });
      }

      onReady();
    }

    handleHash().catch(() => {
      if (!cancelled) {
        setError("Your reset link is invalid or has expired. Please request a new one.");
        onReady();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [onReady]);

  if (!error) return null;

  return (
    <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {error}
    </p>
  );
}
