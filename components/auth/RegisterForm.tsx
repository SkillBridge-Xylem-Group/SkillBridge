"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isPasswordValid, PASSWORD_MAX_LENGTH } from "@/lib/auth/password";
import PasswordField from "./PasswordField";
import PasswordRequirements from "./PasswordRequirements";
import GoogleButton from "./GoogleButton";

export default function RegisterForm() {
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
        const fieldError = data?.details?.confirmPassword?.[0] ?? data?.details?.email?.[0];
        setError(fieldError ?? data?.error ?? "Registration failed. Please try again.");
        return;
      }

      if (data.requiresConfirmation) {
        setConfirmationMessage(data.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmationMessage) {
    return (
      <>
        <h1 className="text-3xl font-medium sm:text-4xl" style={{ fontFamily: "var(--font-heading)", color: "var(--color-carbon)" }}>
          Check your email
        </h1>
        <p className="mt-4" style={{ color: "var(--color-charcoal)" }}>{confirmationMessage}</p>
        <p className="mt-6 text-sm" style={{ color: "var(--color-charcoal)" }}>
          <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--color-brand-blue)" }}>
            Back to Sign In
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-medium sm:text-3xl" style={{ fontFamily: "var(--font-heading)", color: "var(--color-carbon)" }}>
        Welcome to SkillBridge
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--color-mid-gray)" }}>Create your account</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Honeypot — hidden from users, bots often fill this field */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="fullName" className="text-sm font-medium" style={{ color: "var(--color-carbon)" }}>
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1.5 w-full border px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none"
            style={{ borderColor: "var(--color-fog)", borderRadius: "12px", color: "var(--color-carbon)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-blue)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-fog)")}
          />
        </div>

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
            style={{ borderColor: "var(--color-fog)", borderRadius: "12px", color: "var(--color-carbon)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-blue)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-fog)")}
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />

        <PasswordRequirements
          password={password}
          open={passwordFocused || (password.length > 0 && !isPasswordValid(password))}
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
        />

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Signing Up..." : "Sign Up"}
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
        Already have an account?{" "}
        <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--color-brand-blue)" }}>
          Sign In
        </Link>
      </p>
    </>
  );
}
