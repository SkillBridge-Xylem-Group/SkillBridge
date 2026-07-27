"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Mail } from "lucide-react";
import { isPasswordValid, PASSWORD_MAX_LENGTH } from "@/lib/auth/password";
import NeumorphicPasswordField from "./NeumorphicPasswordField";
import PasswordRequirements from "./PasswordRequirements";
import GoogleButton from "./GoogleButton";
import AuthHoneypot from "./AuthHoneypot";

type RegisterFormProps = {
  onSwitchToLogin: () => void;
};

const OPTIMISTIC_CONFIRMATION_MESSAGE =
  "If this email is eligible for an account, please check your inbox to confirm your registration.";

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [formStartedAt, setFormStartedAt] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleResend() {
    setResendMessage("");
    setIsResending(true);
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("Retry-After")) || 30;
        setResendCooldown(retryAfter);
        setResendMessage("Too many requests — please wait before trying again.");
        return;
      }

      setResendMessage(data?.message ?? "If eligible, a new email is on its way.");
      setResendCooldown(30);
    } catch {
      setResendMessage("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  useEffect(() => {
    setFormStartedAt(Date.now());
  }, []);

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
    } catch {
      setError("Could not start Google sign-in. Please try again.");
      setIsGoogleLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    if (!isPasswordValid(password)) {
      setError(
        "Password must be 8–128 characters and include uppercase, lowercase, a number, and a special character."
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    // Optimistic UI: Supabase's signUp() call — which is what actually
    // triggers the confirmation email — takes ~3-4s in practice because it
    // waits on the SMTP handshake with Brevo before returning at all (this
    // is the confirmed root cause behind BUG-015's "delayed activation
    // email" reports; see route.ts). Making every user stare at a spinner
    // for that long is a worse experience than just showing them the
    // outcome we already expect, since the account + email dispatch is
    // already happening server-side regardless of when we render this.
    // If something genuinely goes wrong below (rate limit, breached
    // password, server error), we roll this back and show the real error.
    setConfirmationMessage(OPTIMISTIC_CONFIRMATION_MESSAGE);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
          website,
          formStartedAt,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Something actually failed — roll back to the form and show why.
        setConfirmationMessage("");
        const fieldError = data?.details?.confirmPassword?.[0] ?? data?.details?.email?.[0];
        setError(fieldError ?? data?.error ?? "Registration failed. Please try again.");
        return;
      }

      if (data.requiresConfirmation) {
        // Replace with the server's exact message in case it ever differs
        // (e.g. a future wording change) — no-op visually in the common case.
        setConfirmationMessage(data.message);
        return;
      }

      // Confirmation not required (e.g. email confirmations disabled) —
      // skip the confirmation screen entirely and go straight in.
      setConfirmationMessage("");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setConfirmationMessage("");
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmationMessage) {
    return (
      <>
        <div className="flex justify-center">
          <Image src="/images/logo-mark-v2.png" alt="SkillBridge" width={56} height={56} className="shrink-0" />
        </div>
        <div className="w-full max-w-sm text-center">
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl" style={{ color: "var(--auth-teal-dark)", fontFamily: "var(--font-playful)" }}>
          Check your email
        </h1>
        <p className="mt-4 text-sm" style={{ color: "var(--neu-text-muted)" }}>
          {confirmationMessage}
        </p>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || resendCooldown > 0}
          className="auth-neu-link mt-4 text-sm disabled:opacity-60"
        >
          {isResending
            ? "Sending..."
            : resendCooldown > 0
              ? `Resend available in ${resendCooldown}s`
              : "Didn't get it? Resend confirmation email"}
        </button>

        {resendMessage && (
          <p className="mt-2 text-xs" style={{ color: "var(--neu-text-muted)" }}>
            {resendMessage}
          </p>
        )}

        <p className="mt-6 text-sm" style={{ color: "var(--neu-text-muted)" }}>
          <button type="button" onClick={onSwitchToLogin} className="auth-neu-link text-sm">
            Back to Sign In
          </button>
        </p>
        </div>
      </>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-center">
        <Image src="/images/logo-mark-v2.png" alt="SkillBridge" width={56} height={56} className="shrink-0" />
      </div>
      <h1 className="mt-3 text-center text-2xl font-semibold sm:text-3xl" style={{ color: "var(--auth-teal-dark)", fontFamily: "var(--font-playful)" }}>
        Create Account
      </h1>
      <p className="mt-1 text-center text-sm" style={{ color: "var(--neu-text-muted)" }}>
        Join SkillBridge and start swapping skills
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <AuthHoneypot value={website} onChange={setWebsite} />

        <div className="relative">
          <User size={18} className="auth-neu-icon" style={{ color: "var(--auth-teal-dark)" }} />
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="auth-neu-input"
          />
        </div>

        <div className="relative">
          <Mail size={18} className="auth-neu-icon" style={{ color: "var(--auth-emerald)" }} />
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

        <NeumorphicPasswordField
          id="password"
          placeholder="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          iconColor="var(--neu-secondary)"
        />

        <PasswordRequirements
          password={password}
          open={passwordFocused || (password.length > 0 && !isPasswordValid(password))}
        />

        <NeumorphicPasswordField
          id="confirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          iconColor="var(--auth-mint)"
        />

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-neu-button w-full py-3.5 text-sm"
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
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
    </div>
  );
}