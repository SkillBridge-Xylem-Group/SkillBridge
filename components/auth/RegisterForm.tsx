"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import PasswordField from "./PasswordField";
import GoogleButton from "./GoogleButton";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }
    setError("");
    // TODO: hubungkan ke API auth
    console.log({ fullName, email, password });
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
          className="btn-pill w-full bg-brand py-4 text-base text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
        >
          Sign Up
        </button>
      </form>

      <div className="mt-7 flex items-center gap-3">
        <span className="text-sm font-bold text-slate-900">Sign Up with</span>
        <GoogleButton label="Sign up with Google" />
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