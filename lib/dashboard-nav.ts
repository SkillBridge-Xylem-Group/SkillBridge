import { Home, Users, Repeat2, MessagesSquare, User, type LucideIcon } from "lucide-react";

export type DashboardNavKey = "home" | "browse" | "swaps" | "forum" | "profile";

export type DashboardNavItem = {
  key: DashboardNavKey;
  href: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { key: "home", href: "/dashboard", icon: Home },
  { key: "browse", href: "/dashboard/browse-people", icon: Users },
  { key: "swaps", href: "/dashboard/swap-requests", icon: Repeat2 },
  { key: "forum", href: "/dashboard/forum", icon: MessagesSquare },
  { key: "profile", href: "/dashboard/profile", icon: User },
];

export function isDashboardNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/dashboard/profile") return pathname === "/dashboard/profile";
  return pathname === href || pathname.startsWith(`${href}/`);
}
