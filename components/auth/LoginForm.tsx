"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordField from "./PasswordField";
import GoogleButton from "./GoogleButton";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: ganti dengan pemanggilan API auth beneran.
    // Setelah API bilang sukses, baru jalankan router.push("/dashboard").
    console.log({ email, password, remember });
    router.push("/dashboard");
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Welcome To SkillBridge
      </h1>
      <p className="mt-2 text-slate-500">Sign in to your account</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/30"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-semibold text-brand hover:underline">
            Forgot Password ?
          </Link>
        </div>

        <button
          type="submit"
          className="btn-pill w-full bg-brand py-4 text-base text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
        >
          Sign In
        </button>
      </form>

      <div className="mt-7 flex items-center gap-3">
        <span className="text-sm font-bold text-slate-900">Sign In with</span>
        <GoogleButton label="Sign in with Google" />
      </div>

      <p className="mt-6 text-sm text-slate-600">
        Don&apos;t have an account ?{" "}
        <Link href="/register" className="font-bold text-brand hover:underline">
          Sign Up
        </Link>
      </p>
    </>
  );
}