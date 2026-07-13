import { Suspense } from "react";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import AuthConfirmClient from "@/components/auth/AuthConfirmClient";

export const metadata: Metadata = {
  title: "Confirming | SkillBridge",
};

export default function AuthConfirmPage() {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <p className="text-sm" style={{ color: "var(--color-charcoal)" }}>
            Verifying your link...
          </p>
        }
      >
        <AuthConfirmClient />
      </Suspense>
    </AuthShell>
  );
}
