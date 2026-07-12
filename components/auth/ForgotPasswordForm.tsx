"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
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
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to send reset link. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-medium sm:text-4xl" style={{ fontFamily: "var(--font-heading)", color: "var(--color-carbon)" }}>
        Forgot Password
      </h1>
      <p className="mt-3" style={{ color: "var(--color-charcoal)" }}>
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {sent ? (
        <p
          className="mt-8 px-4 py-3.5 text-sm font-medium"
          style={{ backgroundColor: "var(--color-blue-wash)", color: "var(--color-brand-blue-deep)", borderRadius: "12px" }}
        >
          If an account exists for {email}, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--color-carbon)" }}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border px-4 py-3.5 text-sm placeholder:text-slate-400 focus:outline-none"
              style={{ borderColor: "var(--color-fog)", borderRadius: "12px", color: "var(--color-carbon)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-blue)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-fog)")}
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Sending..." : "Send Reset Link"}
            <ArrowRight size={18} />
          </button>
        </form>
      )}

      <Link
        href="/login"
        className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-medium hover:underline"
        style={{ color: "var(--color-brand-blue)" }}
      >
        <ArrowLeft size={16} />
        Back to login
      </Link>
    </>
  );
}
