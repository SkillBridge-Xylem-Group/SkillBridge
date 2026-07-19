"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useFormGuard } from "@/hooks/useFormGuard";
import NeumorphicPasswordField from "./NeumorphicPasswordField";
import GoogleButton from "./GoogleButton";
import AuthHoneypot from "./AuthHoneypot";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { signOutEverywhere } from "@/lib/auth/sign-out";
import { isAdminUser } from "@/lib/auth/isAdmin";

type LoginFormProps = {
  redirectTo?: string | null;
  urlError?: string | null;
  justLoggedOut?: boolean;
  onForgotPassword: () => void;
  onSwitchToSignup: () => void;
};

export default function LoginForm({
  redirectTo: redirectToProp,
  urlError,
  justLoggedOut = false,
  onForgotPassword,
  onSwitchToSignup,
}: LoginFormProps) {
  const router = useRouter();
  const redirectTo = getSafeRedirectPath(redirectToProp);
  const { website, setWebsite } = useFormGuard();
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

  // Drop sticky auth-unavailable from the URL so a one-off timeout does not
  // keep blocking the user psychologically after the form is usable again.
  useEffect(() => {
    if (urlError !== "auth-unavailable" || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has("error")) return;
    url.searchParams.delete("error");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [urlError]);

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

      // Admin accounts only sign in through the internal admin portal, never
      // the public form. Same generic message as bad credentials — this page
      // never confirms an account is an admin.
      if (await isAdminUser(supabase, data.user.id)) {
        await supabase.auth.signOut();
        setError("Invalid email or password");
        return;
      }

      // Cookies are already set by the browser client; one navigation is enough.
      router.replace(redirectTo);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold sm:text-3xl" style={{ color: "var(--auth-emerald-dark)", fontFamily: "var(--font-playful)" }}>
        SkillBridge
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--neu-text-muted)" }}>
        Sign in to your account
      </p>

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
          We could not verify your session just now. You can still sign in below.
        </p>
      )}

      {urlError === "account-suspended" && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This account has been suspended. Contact support if you think this is a mistake.
        </p>
      )}

      {justLoggedOut && (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          You have been signed out. Please sign in again to continue.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <AuthHoneypot value={website} onChange={setWebsite} />

        <div className="relative">
          <Mail size={18} className="auth-neu-icon" style={{ color: "var(--auth-emerald-dark)" }} />
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-neu-input"
          />
        </div>

        <NeumorphicPasswordField id="password" value={password} onChange={setPassword} iconColor="var(--auth-teal-dark)" />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2" style={{ color: "var(--neu-text-muted)" }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded"
              style={{ accentColor: "var(--neu-major)" }}
            />
            Remember me
          </label>
          <button type="button" onClick={onForgotPassword} className="auth-neu-link text-sm">
            Forgot Password?
          </button>
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-neu-button w-full py-3.5 text-sm"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-5 flex items-center gap-3 text-xs font-medium" style={{ color: "var(--neu-text-muted)" }}>
        <div className="h-px flex-1" style={{ backgroundColor: "var(--neu-shadow-dark)" }} />
        or
        <div className="h-px flex-1" style={{ backgroundColor: "var(--neu-shadow-dark)" }} />
      </div>

      <div className="mt-5">
        <GoogleButton
          label={isGoogleLoading ? "Redirecting to Google..." : "Continue with Google"}
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isSubmitting}
        />
      </div>

      <p className="mt-5 text-sm" style={{ color: "var(--neu-text-muted)" }}>
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitchToSignup} className="auth-neu-link text-sm">
          Sign Up
        </button>
      </p>
    </div>
  );
}
