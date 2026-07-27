"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Mail } from "lucide-react";
import { useFormGuard } from "@/hooks/useFormGuard";
import NeumorphicPasswordField from "./NeumorphicPasswordField";
import AuthHoneypot from "./AuthHoneypot";

const GENERIC_ERROR = "Invalid email or password.";
const RATE_LIMITED_ERROR = "Too many attempts. Try again later.";
const MFA_ERROR = "Invalid verification code.";
const MFA_REQUIRED_NOTICE = "Enter the 6-digit code from your authenticator app.";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { website, setWebsite, guardPayload } = useFormGuard();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaChallenge, setMfaChallenge] = useState<{
    factorId: string;
    challengeId: string;
  } | null>(null);
  const [error, setError] = useState(
    searchParams.get("error") === "mfa-required" ? MFA_REQUIRED_NOTICE : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (website) {
      setError(GENERIC_ERROR);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          ...guardPayload,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setError(RATE_LIMITED_ERROR);
        return;
      }

      if (res.status === 403) {
        setError("Access denied from this network.");
        return;
      }

      if (!res.ok) {
        if (res.status === 404) {
          setError("Login service unavailable. Restart the dev server and try again.");
          return;
        }
        setError(GENERIC_ERROR);
        return;
      }

      if (body?.requiresMfa && body?.factorId && body?.challengeId) {
        setMfaChallenge({ factorId: body.factorId, challengeId: body.challengeId });
        setMfaCode("");
        setError(MFA_REQUIRED_NOTICE);
        return;
      }

      router.replace("/dashboard/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMfaSubmit(e: FormEvent) {
    e.preventDefault();
    if (!mfaChallenge) return;

    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/admin-login/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factorId: mfaChallenge.factorId,
          challengeId: mfaChallenge.challengeId,
          code: mfaCode.trim(),
        }),
      });

      if (res.status === 403) {
        setError("Access denied from this network.");
        return;
      }

      if (!res.ok) {
        setError(MFA_ERROR);
        return;
      }

      router.replace("/dashboard/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-neu-page flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="auth-neu-card-mobile w-full max-w-sm rounded-[32px] p-8 sm:p-10">
        <div className="flex justify-center">
          <Image src="/images/logo-mark.png" alt="SkillBridge" width={64} height={64} priority className="shrink-0" />
        </div>
        <p className="mt-4 text-center text-sm" style={{ color: "var(--neu-text-muted)" }}>
          {mfaChallenge ? "Two-factor verification" : "Sign in to your account"}
        </p>

        {mfaChallenge ? (
          <form onSubmit={handleMfaSubmit} className="mt-5 space-y-4">
            <input
              id="mfa-code"
              name="mfa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              placeholder="6-digit code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="auth-neu-input text-center tracking-[0.35em]"
            />

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting || mfaCode.length !== 6}
              className="auth-neu-button w-full py-3.5 text-sm"
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </button>

            <button
              type="button"
              className="w-full text-sm text-[var(--neu-text-muted)] hover:underline"
              onClick={() => {
                setMfaChallenge(null);
                setMfaCode("");
                setError("");
              }}
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
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

            <NeumorphicPasswordField
              id="password"
              value={password}
              onChange={setPassword}
              iconColor="var(--auth-teal-dark)"
            />

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="auth-neu-button w-full py-3.5 text-sm"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
