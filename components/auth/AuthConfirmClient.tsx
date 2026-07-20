"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";

function destinationFor(type: EmailOtpType | null) {
  return type === "recovery" ? "/reset-password" : "/login";
}

async function completeRecovery(payload: Record<string, string>) {
  const res = await fetch("/api/auth/complete-recovery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, type: "recovery" }),
  });
  return res.ok;
}

export default function AuthConfirmClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Verifying your link...");

  useEffect(() => {
    let cancelled = false;

    async function confirmFromHash() {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      if (!hash) return false;

      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type") as EmailOtpType | null;

      if (!accessToken || !refreshToken || !type) return false;

      window.history.replaceState(null, "", window.location.pathname + window.location.search);

      if (type === "recovery") {
        const ok = await completeRecovery({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!ok) return false;
        router.replace("/reset-password");
        return true;
      }

      // Non-recovery hash flows still need client session bootstrap.
      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return false;
      router.replace(destinationFor(type));
      return true;
    }

    async function confirm() {
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as EmailOtpType | null;
      const code = searchParams.get("code");
      const destination = destinationFor(type);

      try {
        if (await confirmFromHash()) return;

        if (type === "recovery") {
          if (tokenHash) {
            const ok = await completeRecovery({ token_hash: tokenHash });
            if (ok) {
              router.replace("/reset-password");
              return;
            }
          }
          if (code) {
            const ok = await completeRecovery({ code });
            if (ok) {
              router.replace("/reset-password");
              return;
            }
          }
        } else {
          const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
          const supabase = createSupabaseBrowserClient();

          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error) {
              router.replace(destination);
              return;
            }
            console.error("[auth/confirm] exchangeCodeForSession:", error.message);
          }

          if (tokenHash && type) {
            const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
            if (!error) {
              router.replace(destination);
              return;
            }
            console.error("[auth/confirm] verifyOtp:", error.message);
          }
        }

        if (!cancelled) {
          setStatus("error");
          setMessage("This link is invalid or has expired. Please request a new one.");
        }
      } catch (err) {
        console.error("[auth/confirm] client error:", err);
        if (!cancelled) {
          setStatus("error");
          setMessage("Something went wrong while verifying your link. Please try again.");
        }
      }
    }

    confirm();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (status === "loading") {
    return (
      <>
        <div
          className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-transparent"
          style={{ borderTopColor: "var(--neu-major)", borderRightColor: "var(--neu-major)" }}
          aria-hidden="true"
        />
        <h1
          className="text-2xl font-extrabold sm:text-3xl"
          style={{ fontFamily: "var(--font-friendly)", color: "var(--neu-ink)" }}
        >
          Verifying
        </h1>
        <p className="mt-3 text-sm" style={{ color: "var(--neu-text-muted)" }}>
          {message}
        </p>
      </>
    );
  }

  return (
    <>
      <h1
        className="text-2xl font-extrabold sm:text-3xl"
        style={{ fontFamily: "var(--font-friendly)", color: "var(--neu-ink)" }}
      >
        Link expired
      </h1>
      <p className="mt-3 text-sm" style={{ color: "var(--neu-text-muted)" }}>
        {message}
      </p>
      <Link
        href="/forgot-password"
        className="auth-neu-link mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Request a new reset link
      </Link>
    </>
  );
}
