import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | SkillBridge",
};

export default function ResetPasswordPage() {
  return (
    <div className="auth-neu-page flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="auth-neu-card relative w-full max-w-[520px] overflow-hidden rounded-[50px] px-10 py-14 sm:px-16">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
