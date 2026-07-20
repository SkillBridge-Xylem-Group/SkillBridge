import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Reset Password | SkillBridge",
};

export default function ResetPasswordPage() {
  return (
    <div className="auth-neu-page relative flex min-h-screen items-center justify-center p-4 sm:p-6">
      <Link
        href="/"
        aria-label="Back to landing"
        className="absolute left-4 top-4 z-50 inline-flex items-center justify-center rounded-full bg-white/70 p-2 text-slate-800 shadow-sm"
      >
        <ArrowLeft size={18} />
      </Link>

      <div className="auth-neu-card relative w-full max-w-[520px] overflow-hidden rounded-[50px] px-10 py-14 sm:px-16">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
