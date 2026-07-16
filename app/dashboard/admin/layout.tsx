import { type ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import AdminLayout from "@/components/dashboard/AdminLayout";

export default async function AdminRouteLayout({ children }: { children: ReactNode }) {
  // Redirects non-admins before anything below this ever runs or renders.
  await requireAdmin();

  return <AdminLayout>{children}</AdminLayout>;
}