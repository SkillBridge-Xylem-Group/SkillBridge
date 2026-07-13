"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isPasswordValid, PASSWORD_MAX_LENGTH } from "@/lib/auth/password";
import PasswordField from "./PasswordField";
import PasswordRequirements from "./PasswordRequirements";
import ResetPasswordHashHandler from "./ResetPasswordHashHandler";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const handleSessionReady = useCallback(() => {
    setSessionReady(true);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!isPasswordValid(password)) {
      setError(
        "Password must be 8–128 characters and include uppercase, lowercase, a number, and a special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Failed to reset password. Please try again.");
        return;
      }

      setDone(true);
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done) {
    return (
      <>
        <h1
          className="text-3xl font-medium sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-carbon)" }}
        >
          Password Updated
        </h1>
        <p className="mt-3" style={{ color: "var(--color-charcoal)" }}>
          Your password has been changed. Redirecting you to sign in...
        </p>
        <Link
          href="/login"
          className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: "var(--color-brand-blue)" }}
        >
          <ArrowLeft size={16} />
          Go to Sign In
        </Link>
      </>
    );
  }

  return (
    <>
      <ResetPasswordHashHandler onReady={handleSessionReady} />

      <h1
        className="text-3xl font-medium sm:text-4xl"
        style={{ fontFamily: "var(--font-heading)", color: "var(--color-carbon)" }}
      >
        Reset Password
      </h1>
      <p className="mt-3" style={{ color: "var(--color-charcoal)" }}>
        Choose a new password for your account.
      </p>

      {!sessionReady ? (
        <p className="mt-8 text-sm" style={{ color: "var(--color-mid-gray)" }}>
          Verifying your reset link...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <PasswordField
            id="password"
            label="New Password"
            placeholder="Enter your new password"
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
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            maxLength={PASSWORD_MAX_LENGTH}
          />

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}

      <Link
        href="/forgot-password"
        className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-medium hover:underline"
        style={{ color: "var(--color-brand-blue)" }}
      >
        <ArrowLeft size={16} />
        Request a new reset link
      </Link>
    </>
  );
}
