"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PASSWORD_MAX_LENGTH } from "@/lib/auth/password";
import { useFormGuard } from "@/hooks/useFormGuard";
import PasswordField from "./PasswordField";
import GoogleButton from "./GoogleButton";
import AuthHoneypot from "./AuthHoneypot";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { signOutEverywhere } from "@/lib/auth/sign-out";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirectTo"));
  const urlError = searchParams.get("error");
  const justLoggedOut = searchParams.get("loggedOut") === "1";
  const { website, setWebsite, guardPayload } = useFormGuard();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Safety net: if login opened right after logout, wipe any leftover session
  // so the user cannot land on dashboard without signing in again.
  useEffect(() => {
    if (!justLoggedOut) return;
    void signOutEverywhere();
  }, [justLoggedOut]);

  async function handleGoogleSignIn() {
    setError("");
    setIsGoogleLoading(true);
    try {
      const { startGoogleOAuth } = await import("@/lib/supabase/oauth-client");
      const { error } = await startGoogleOAuth();
      if (error) {
        setError(error);
        setIsGoogleLoading(false);
      }
      // On success we navigate away to Google; keep loading state.
    } catch {
      setError("Could not start Google sign-in. Please try again.");
      setIsGoogleLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError || !data.user) {
        setError("Invalid email or password");
        return;
      }

      if (!data.user.email_confirmed_at) {
        const usesEmailPassword = data.user.identities?.some((i) => i.provider === "email");
        if (usesEmailPassword) {
          await supabase.auth.signOut();
          setError("Please confirm your email before signing in.");
          return;
        }
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-medium sm:text-3xl" style={{ fontFamily: "var(--font-heading)", color: "var(--color-carbon)" }}>
        Welcome to SkillBridge
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--color-mid-gray)" }}>Sign in to your account</p>

      {urlError === "confirm-email" && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Please confirm your email before signing in. Check your inbox for the confirmation link.
        </p>
      )}

      {urlError === "confirmation-failed" && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This link is invalid or has expired. Please request a new password reset link.
        </p>
      )}

      {urlError === "auth-unavailable" && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Sign-in service is temporarily unavailable. Please try again in a moment.
        </p>
      )}

      {justLoggedOut && (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          You have been signed out. Please sign in again to continue.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <AuthHoneypot value={website} onChange={setWebsite} />

        <div>
          <label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--color-carbon)" }}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full border px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none"
            style={{
              borderColor: "var(--color-fog)",
              borderRadius: "12px",
              color: "var(--color-carbon)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-blue)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-fog)")}
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          maxLength={PASSWORD_MAX_LENGTH}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2" style={{ color: "var(--color-charcoal)" }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded"
              style={{ accentColor: "var(--color-brand-blue)" }}
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-medium hover:underline" style={{ color: "var(--color-brand-blue)" }}>
            Forgot Password?
          </Link>
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-5 flex items-center gap-3 text-xs font-medium" style={{ color: "var(--color-mid-gray)" }}>
        <div className="h-px flex-1" style={{ backgroundColor: "var(--color-fog)" }} />
        or
        <div className="h-px flex-1" style={{ backgroundColor: "var(--color-fog)" }} />
      </div>

      <div className="mt-5">
        <GoogleButton
          label={isGoogleLoading ? "Redirecting to Google..." : "Continue with Google"}
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isSubmitting}
        />
      </div>

      <p className="mt-5 text-sm" style={{ color: "var(--color-charcoal)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium hover:underline" style={{ color: "var(--color-brand-blue)" }}>
          Sign Up
        </Link>
      </p>
    </>
  );
}
