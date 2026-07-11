"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import PasswordField from "./PasswordField";
import PasswordRequirements from "./PasswordRequirements";
import { isPasswordValid } from "@/lib/auth/password";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isPasswordValid(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character."
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
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Password Updated</h1>
        <p className="mt-3 text-slate-500">Redirecting you to login...</p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Set a New Password</h1>
      <p className="mt-2 text-slate-500">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <PasswordField
          id="password"
          label="New Password"
          placeholder="Enter your new password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />

        <PasswordRequirements password={password} />

        <PasswordField
          id="confirmPassword"
          label="Confirm New Password"
          placeholder="Re-enter your new password"
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
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </>
  );
}
