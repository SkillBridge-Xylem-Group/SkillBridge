import type { ReactNode } from "react";
import { headers } from "next/headers";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default async function DashboardRootLayout({ children }: { children: ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  // Admin has its own chrome — don't wrap it in the user dashboard shell.
  if (pathname.startsWith("/dashboard/admin")) {
    return children;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
