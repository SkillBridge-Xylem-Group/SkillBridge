"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck } from "lucide-react";

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F7FB] px-6 py-16">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand/90 sm:h-72 sm:w-72" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-gradient-to-br from-brand to-[#5A47E0]" />

      <div className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-2">
        {/* Left: illustration */}
        <div className="relative hidden items-center justify-center bg-[#F5F5FA] p-10 lg:flex">
          {/* Wrapper TANPA overflow-hidden, tempat badge menempel */}
          <div className="relative h-72 w-72">
            {/* Lingkaran gambar, overflow-hidden HANYA di sini */}
            <div className="h-full w-full overflow-hidden rounded-full bg-white shadow-inner">
              <img
                src="/images/forgot-password-illustration.jpg"
                alt="Person thinking about their password"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Badge kunci */}
            <div className="absolute -left-4 -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg">
              <KeyRound size={22} />
            </div>

            {/* Badge perisai keamanan */}
            <div className="absolute -bottom-2 -right-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-lg">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex flex-col justify-center px-8 py-12 sm:px-12">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Forgot Password
          </h1>
          <p className="mt-3 text-slate-500">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {sent ? (
            <p className="mt-8 rounded-xl bg-brand-light px-4 py-3.5 text-sm font-medium text-brand">
              If an account exists for {email}, a reset link is on its way.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="text-sm font-bold text-slate-900">
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
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {error && <p className="text-sm font-medium text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-pill flex w-full items-center justify-center gap-2 bg-brand py-4 text-base text-white shadow-lg shadow-brand/30 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          <Link
            href="/login"
            className="mx-auto mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}