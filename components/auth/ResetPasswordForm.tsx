"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CheckCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isPasswordValid, PASSWORD_MAX_LENGTH } from "@/lib/auth/password";
import NeumorphicPasswordField from "./NeumorphicPasswordField";
import ResetPasswordHashHandler from "./ResetPasswordHashHandler";

function strengthOf(password: string): { percent: number; color: string } {
  let strength = 0;
  if (password.length > 5) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 25;

  const color =
    strength <= 25
      ? "var(--neu-coral)"
      : strength <= 50
        ? "var(--neu-orange)"
        : strength <= 75
          ? "var(--neu-indigo)"
          : "var(--neu-teal)";

  return { percent: strength, color };
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const handleSessionReady = useCallback(() => {
    setSessionReady(true);
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });
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
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message || "Failed to reset password. Please try again.");
        return;
      }

      await supabase.auth.signOut();
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
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 size={72} style={{ color: "var(--neu-teal)" }} />
        <h2 className="mt-5 text-2xl font-semibold" style={{ color: "var(--neu-indigo)", fontFamily: "var(--font-playful)" }}>
          Password Updated!
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--neu-text-muted)" }}>
          Your password has been changed successfully.
          <br />
          You can now log in with your new credentials.
        </p>
        <Link href="/login" className="auth-neu-button mt-6 flex items-center justify-center gap-2 px-10 py-3.5 text-sm">
          Go to Login
        </Link>
      </div>
    );
  }

  const showForm = sessionReady;
  const waitingMessage = sessionReady ? null : "Verifying your reset link...";
  const strength = strengthOf(password);

  return (
    <div>
      <ResetPasswordHashHandler onReady={handleSessionReady} />

      <h2 className="text-2xl font-semibold" style={{ color: "var(--neu-indigo)", fontFamily: "var(--font-playful)" }}>
        Set New Password
      </h2>
      <p className="mt-2 text-sm" style={{ color: "var(--neu-text-muted)" }}>
        Enter your new credentials below to update your account access.
      </p>

      {!showForm ? (
        <p className="mt-8 text-sm" style={{ color: "var(--neu-text-muted)" }}>
          {error || waitingMessage}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <NeumorphicPasswordField
            id="password"
            placeholder="New Password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            maxLength={PASSWORD_MAX_LENGTH}
            iconColor="var(--neu-indigo)"
          />

          <div className="auth-neu-strength-track">
            <div
              className="auth-neu-strength-bar"
              style={{ width: `${strength.percent}%`, backgroundColor: strength.color }}
            />
          </div>

          <NeumorphicPasswordField
            id="confirmPassword"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            maxLength={PASSWORD_MAX_LENGTH}
            icon={CheckCircle}
            iconColor="var(--neu-teal)"
          />

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="auth-neu-button mt-2 w-full py-3.5 text-sm">
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}

      <Link
        href="/forgot-password"
        className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm auth-neu-link"
      >
        <ArrowLeft size={16} />
        Request a new reset link
      </Link>
    </div>
  );
}
