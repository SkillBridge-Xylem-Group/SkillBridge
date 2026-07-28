import {
  LayoutDashboard,
  Users,
  Users2,
  Flag,
  Award,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Admin Dashboard", shortLabel: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Users", shortLabel: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Community Management", shortLabel: "Communities", href: "/dashboard/admin/community", icon: Users2 },
  { label: "Reports", shortLabel: "Reports", href: "/dashboard/admin/reports", icon: Flag },
  { label: "Badges", shortLabel: "Badges", href: "/dashboard/admin/badges", icon: Award },
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/dashboard/admin") return pathname === "/dashboard/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}