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
  // Manage communities lives under /forum but is its own sidebar entry.
  if (href === "/dashboard/forum") {
    if (
      pathname === "/dashboard/forum/communities" ||
      pathname.startsWith("/dashboard/forum/communities/")
    ) {
      return false;
    }
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
