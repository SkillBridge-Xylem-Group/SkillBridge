"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function destinationFor(type: EmailOtpType | null) {
  return type === "recovery" ? "/reset-password" : "/login";
}

export default function AuthConfirmClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Verifying your link...");

  useEffect(() => {
    let cancelled = false;

    async function confirmFromHash(supabase: ReturnType<typeof createSupabaseBrowserClient>) {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      if (!hash) return false;

      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type") as EmailOtpType | null;

      if (!accessToken || !refreshToken || !type) return false;

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      window.history.replaceState(null, "", window.location.pathname + window.location.search);

      if (error) return false;
      router.replace(destinationFor(type));
      return true;
    }

    async function confirm() {
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as EmailOtpType | null;
      const code = searchParams.get("code");
      const destination = destinationFor(type);
      const supabase = createSupabaseBrowserClient();

      try {
        if (await confirmFromHash(supabase)) return;

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