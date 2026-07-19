"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { useFormGuard } from "@/hooks/useFormGuard";
import NeumorphicPasswordField from "./NeumorphicPasswordField";
import AuthHoneypot from "./AuthHoneypot";

const GENERIC_ERROR = "Invalid email or password.";
const RATE_LIMITED_ERROR = "Too many attempts. Try again later.";

/**
 * Same auth-neu visual language as the regular /login card, on purpose —
 * this page should look like an ordinary sign-in form to anyone who stumbles
 * across it, not a distinct "admin" surface. Secrecy comes entirely from the
 * URL never being linked anywhere, not from a different look.
 *
 * Errors are intentionally generic ("Invalid email or password") whether the
 * credentials were wrong OR the account simply isn't an admin, so this page
 * never confirms which case happened to someone who's guessing.
 *
 * The actual sign-in happens server-side via /api/auth/admin-login, which
 * rate-limits and locks out repeated attempts (per IP and per email) —
 * this is the only door into the admin console, so brute-forcing it needs
 * to fail fast, not just fail with a wrong-password message.
 */
export default function AdminLoginForm() {
  const router = useRouter();
  const { website, setWebsite, guardPayload } = useFormGuard();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Honeypot: bots fill hidden fields. Fail silently/generically, no signal.
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

      if (res.status === 429) {
        setError(RATE_LIMITED_ERROR);
        return;
      }

      if (!res.ok) {
        setError(GENERIC_ERROR);
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
        <h1
          className="text-2xl font-semibold sm:text-3xl"
          style={{ color: "var(--auth-emerald-dark)", fontFamily: "var(--font-playful)" }}
        >
          SkillBridge
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--neu-text-muted)" }}>
          Sign in to your account
        </p>

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
      </div>
    </div>
  );
}
