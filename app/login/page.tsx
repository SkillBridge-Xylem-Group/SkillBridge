import type { Metadata } from "next";
import { Suspense } from "react";
import SlidingAuthCard from "@/components/auth/SlidingAuthCard";

export const metadata: Metadata = {
  title: "Sign In | SkillBridge",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-neu-page min-h-screen" />}>
      <SlidingAuthCard />
    </Suspense>
  );
}
