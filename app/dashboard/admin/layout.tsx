import { type ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/requireAdmin";

// Chrome (AdminLayout) is now applied once, at the root dashboard layout —
// this nested layout's only job is the access guard so non-admins still
// get redirected before anything under /dashboard/admin/* renders.
export default async function AdminRouteLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return children;
}