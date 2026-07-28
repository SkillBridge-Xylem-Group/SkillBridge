import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import { isAdminUser } from "@/lib/auth/isAdmin";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminLayout from "@/components/dashboard/AdminLayout";

// Chrome is now chosen by WHO the visitor is, not WHICH page they're on.
// An admin gets the admin sidebar everywhere under /dashboard/* — including
// their own profile, forum posts, messages, etc. — instead of only on
// /dashboard/admin/* paths. This removes the need for admin-only proxy
// routes and fixes every nested link (community cards, post links, profile
// links) that used to kick the admin back into the regular user chrome.
export default async function DashboardRootLayout({ children }: { children: ReactNode }) {
  const { supabase, user } = await getRequestUser();
  if (!user) redirect("/login");

  const isAdmin = await isAdminUser(supabase, user.id);

  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}