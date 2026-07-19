import { Home, Users, Repeat2, MessagesSquare, type LucideIcon } from "lucide-react";

export type DashboardNavKey = "home" | "browse" | "swaps" | "forum";

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
];

export function isDashboardNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/dashboard/profile") return pathname === "/dashboard/profile";
  // Manage communities lives under /dashboard/forum/communities — don't light up Forum.
  if (href === "/dashboard/forum") {
    if (pathname === "/dashboard/forum") return true;
    if (pathname === "/dashboard/forum/communities" || pathname.startsWith("/dashboard/forum/communities/")) {
      return false;
    }
    return pathname.startsWith("/dashboard/forum/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
