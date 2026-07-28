import type { ReactNode } from "react";

// Chrome is now applied once at the root layout (app/dashboard/layout.tsx),
// which picks AdminLayout or DashboardLayout based on the user's role.
// This nested layout used to always apply DashboardLayout on top of that,
// which is what caused the doubled sidebar/topbar for admins.
export default function UserDashboardLayout({ children }: { children: ReactNode }) {
  return children;
}