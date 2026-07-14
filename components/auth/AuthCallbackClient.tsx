"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Finishing sign-in...");

  useEffect(() => {
    let cancelled = false;

    async function finishOAuth() {
      const code = searchParams.get("code");
      const next = getSafeRedirectPath(searchParams.get("next"));
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (errorParam) {
        if (!cancelled) {
          setStatus("error");
          setMessage(errorDescription || "Google sign-in was cancelled or failed.");
        }
        return;
      }

      if (!code) {
        if (!cancelled) {
          setStatus("error");
          setMessage("Missing sign-in code. Please try again.");
        }
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("[auth/callback] exchangeCodeForSession:", error.message);
          if (!cancelled) {
            setStatus("error");
            setMessage(error.message || "Could not complete Google sign-in.");
          }
          return;
        }

        router.replace(next);
        router.refresh();
      } catch (err) {
        console.error("[auth/callback] client error:", err);
        if (!cancelled) {
          setStatus("error");
          setMessage("Something went wrong while finishing Google sign-in.");
        }
      }
    }

    finishOAuth();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (status === "loading") {
    return (
      <>
        <h1
          className="text-3xl font-medium sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-carbon)" }}
        >
          Signing you in
        </h1>
        <p className="mt-3" style={{ color: "var(--color-charcoal)" }}>
          {message}
        </p>
      </>
    );
  }

  return (
    <>
      <h1
        className="text-3xl font-medium sm:text-4xl"
        style={{ fontFamily: "var(--font-heading)", color: "var(--color-carbon)" }}
      >
        Sign-in failed
      </h1>
      <p className="mt-3" style={{ color: "var(--color-charcoal)" }}>
        {message}
      </p>
      <Link
        href="/login"
        className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-medium hover:underline"
        style={{ color: "var(--color-brand-blue)" }}
      >
        <ArrowLeft size={16} />
        Back to Sign In
      </Link>
    </>
  );
}
