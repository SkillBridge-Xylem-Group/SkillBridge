import { Suspense } from "react";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import AuthCallbackClient from "@/components/auth/AuthCallbackClient";

export const metadata: Metadata = {
  title: "Signing in | SkillBridge",
};

export default function AuthCallbackPage() {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <p className="text-sm" style={{ color: "var(--color-charcoal)" }}>
            Finishing sign-in...
          </p>
        }
      >
        <AuthCallbackClient />
      </Suspense>
    </AuthShell>
  );
}
