"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Mail } from "lucide-react";
import { isPasswordValid, PASSWORD_MAX_LENGTH } from "@/lib/auth/password";
import NeumorphicPasswordField from "./NeumorphicPasswordField";
import PasswordRequirements from "./PasswordRequirements";
import GoogleButton from "./GoogleButton";
import AuthHoneypot from "./AuthHoneypot";

type RegisterFormProps = {
  onSwitchToLogin: () => void;
};

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
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl" style={{ color: "var(--neu-coral)", fontFamily: "var(--font-playful)" }}>
          Check your email
        </h1>
        <p className="mt-4 text-sm" style={{ color: "var(--neu-text-muted)" }}>
          {confirmationMessage}
        </p>
        <p className="mt-6 text-sm" style={{ color: "var(--neu-text-muted)" }}>
          <button type="button" onClick={onSwitchToLogin} className="auth-neu-link text-sm">
            Back to Sign In
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold sm:text-3xl" style={{ color: "var(--neu-coral)", fontFamily: "var(--font-playful)" }}>
        Create Account
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--neu-text-muted)" }}>
        Join SkillBridge and start swapping skills
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <AuthHoneypot value={website} onChange={setWebsite} />

        <div className="relative">
          <User size={18} className="auth-neu-icon" style={{ color: "var(--neu-coral)" }} />
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
          <Mail size={18} className="auth-neu-icon" style={{ color: "var(--neu-yellow)" }} />
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
          iconColor="var(--neu-teal)"
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
          iconColor="var(--neu-purple)"
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

      <p className="mt-5 text-sm" style={{ color: "var(--neu-text-muted)" }}>
        Already have an account?{" "}
        <button type="button" onClick={onSwitchToLogin} className="auth-neu-link text-sm">
          Sign In
        </button>
      </p>
    </div>
  );
}
