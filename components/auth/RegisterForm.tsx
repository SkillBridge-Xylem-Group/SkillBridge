"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import PasswordField from "./PasswordField";
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

      router.push("/");
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
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Check your email</h1>
        <p className="mt-4 text-slate-600">{confirmationMessage}</p>
        <p className="mt-6 text-sm text-slate-600">
          <Link href="/login" className="font-bold text-brand hover:underline">
            Back to Sign In
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Welcome To SkillBridge
      </h1>
      <p className="mt-2 text-slate-500">Create your account</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="fullName" className="text-sm font-bold text-slate-900">
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
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-bold text-slate-900">
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
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-pill w-full bg-brand py-4 text-base text-white shadow-lg shadow-brand/30 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      <div className="mt-7 flex items-center gap-3">
        <span className="text-sm font-bold text-slate-900">Sign Up with</span>
        <GoogleButton label="Sign up with Google" onClick={handleGoogleSignIn} />
      </div>

      <p className="mt-6 text-sm text-slate-600">
        Already have an account ?{" "}
        <Link href="/login" className="font-bold text-brand hover:underline">
          Sign In
        </Link>
      </p>
    </>
  );
}