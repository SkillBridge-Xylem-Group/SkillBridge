import type { Metadata } from "next";
import AdminLoginForm from "@/components/auth/AdminLoginForm";

// Deliberately generic <title> and a hard noindex/nofollow/noarchive so this
// page never shows up in search results, previews, or crawler caches. Do NOT
// link to this route from anywhere in the public site — the only way in is
// knowing the exact URL.
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
  return <AdminLoginForm />;
}
