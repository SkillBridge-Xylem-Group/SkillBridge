"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isPasswordValid } from "@/lib/auth/password";
import PasswordField from "./PasswordField";
import PasswordRequirements from "./PasswordRequirements";
import GoogleButton from "./GoogleButton";

export default function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);

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
    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    if (!isPasswordValid(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character."
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, confirmPassword }),
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
        <div>
          <label htmlFor="fullName" className="text-sm font-medium" style={{ color: "var(--color-carbon)" }}>
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
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
        <GoogleButton label="Continue with Google" onClick={handleGoogleSignIn} />
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
