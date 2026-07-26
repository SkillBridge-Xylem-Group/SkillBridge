import { Suspense } from "react";
import type { Metadata } from "next";
import AdminLoginForm from "@/components/auth/AdminLoginForm";

export const metadata: Metadata = {
  title: "Sign In | SkillBridge",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": -1,
      "max-image-preview": "none",
      "max-video-preview": -1,
    },
  },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
