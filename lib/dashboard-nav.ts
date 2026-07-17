import { Home, Users, Repeat2, MessagesSquare, User, type LucideIcon } from "lucide-react";

export type DashboardNavItem = {
  label: string;
  /** Short label for bottom tab bar */
  shortLabel: string;
  href: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { label: "Home", shortLabel: "Home", href: "/dashboard", icon: Home },
  { label: "Browse People", shortLabel: "Browse", href: "/dashboard/browse-people", icon: Users },
  { label: "Skill Swap Requests", shortLabel: "Swaps", href: "/dashboard/swap-requests", icon: Repeat2 },
  { label: "Community Forum", shortLabel: "Forum", href: "/dashboard/forum", icon: MessagesSquare },
  { label: "My Profile", shortLabel: "Profile", href: "/dashboard/profile", icon: User },
];

export function isDashboardNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/dashboard/profile") return pathname === "/dashboard/profile";
  return pathname === href || pathname.startsWith(`${href}/`);
}
