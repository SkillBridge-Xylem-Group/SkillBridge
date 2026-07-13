"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PASSWORD_MAX_LENGTH } from "@/lib/auth/password";
import { useFormGuard } from "@/hooks/useFormGuard";
import PasswordField from "./PasswordField";
import GoogleButton from "./GoogleButton";
import AuthHoneypot from "./AuthHoneypot";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirectTo"));
  const urlError = searchParams.get("error");
  const { website, setWebsite, guardPayload } = useFormGuard();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGoogleSignIn() {
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
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
        <GoogleButton label="Continue with Google" onClick={handleGoogleSignIn} />
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
