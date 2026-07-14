"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  clearGoogleReauthRequired,
  clearOAuthPkceStorage,
  createOAuthBrowserClient,
} from "@/lib/supabase/oauth-client";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Finishing Google sign-in...");

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
          setMessage("Missing sign-in code. Please try again from the login page.");
        }
        return;
      }

      try {
        const oauthClient = createOAuthBrowserClient();
        const { data, error } = await oauthClient.auth.exchangeCodeForSession(code);

        if (error || !data.session) {
          console.error("[auth/callback] exchangeCodeForSession:", error?.message);
          if (!cancelled) {
            const msg = error?.message || "Could not complete Google sign-in.";
            const lower = msg.toLowerCase();
            setStatus("error");
            setMessage(
              lower.includes("verifier")
                ? "Google sign-in expired. Please go back and click “Continue with Google” again in this same browser."
                : lower.includes("database error saving new user")
                  ? "Google verified you, but creating your SkillBridge profile failed (database trigger). Ask an admin to fix the auth.users → public.users trigger in Supabase, then try again."
                  : msg
            );
          }
          return;
        }

        const cookieClient = createSupabaseBrowserClient();
        const { error: syncError } = await cookieClient.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (syncError) {
          console.error("[auth/callback] setSession sync:", syncError.message);
          if (!cancelled) {
            setStatus("error");
            setMessage("Signed in with Google, but saving your session failed. Please try again.");
          }
          return;
        }

        clearOAuthPkceStorage();
        clearGoogleReauthRequired();

        if (cancelled) return;
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
