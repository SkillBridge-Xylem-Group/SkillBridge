import { LayoutDashboard, Users, Flag, MessagesSquare, type LucideIcon } from "lucide-react";

export type AdminNavItem = {
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Overview", shortLabel: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Users", shortLabel: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Community", shortLabel: "Community", href: "/dashboard/admin/community", icon: MessagesSquare },
  { label: "Flagged Content", shortLabel: "Flags", href: "/dashboard/admin/reports", icon: Flag },
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/dashboard/admin") return pathname === "/dashboard/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}