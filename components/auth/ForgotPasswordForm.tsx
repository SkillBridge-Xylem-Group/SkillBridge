"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { useFormGuard } from "@/hooks/useFormGuard";
import AuthHoneypot from "./AuthHoneypot";

const GENERIC_SUCCESS_MESSAGE = "If an account exists for this email, a reset link is on its way.";

type ForgotPasswordFormProps = {
  onBackToLogin: () => void;
};

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const { website, setWebsite, guardPayload } = useFormGuard();
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, ...guardPayload }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const fieldError = data?.details?.email?.[0];
        setError(fieldError ?? data?.error ?? "Failed to send reset link. Please try again.");
        return;
      }

      setSuccessMessage(data?.message ?? GENERIC_SUCCESS_MESSAGE);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold sm:text-3xl" style={{ color: "var(--neu-secondary)", fontFamily: "var(--font-playful)" }}>
        Reset Password
      </h1>
      <p className="mt-3 text-sm" style={{ color: "var(--neu-text-muted)" }}>
        Enter your email and we&apos;ll send you instructions to reset your password.
      </p>

      {successMessage ? (
        <p className="mt-6 rounded-2xl px-4 py-3.5 text-sm font-medium" style={{ color: "var(--neu-major)" }}>
          {successMessage}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <AuthHoneypot value={website} onChange={setWebsite} />

          <div className="relative">
            <Mail size={18} className="auth-neu-icon" style={{ color: "var(--neu-secondary)" }} />
            <input
              id="reset-email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-neu-input"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="auth-neu-button w-full py-3.5 text-sm">
            {isSubmitting ? "Sending..." : "Send Link"}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onBackToLogin}
        className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm auth-neu-link"
      >
        <ArrowLeft size={16} />
        Back to Login
      </button>
    </div>
  );
}
