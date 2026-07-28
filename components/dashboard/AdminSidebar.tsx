"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  MessagesSquare,
  Repeat2,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_NAV_ITEMS, isAdminNavActive } from "@/lib/admin-nav";

const STORAGE_KEY = "skillbridge-admin-sidebar-collapsed";

type TopNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const TOP_NAV_ITEMS: TopNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, isActive: (p) => p === "/dashboard" },
  {
    href: "/dashboard/forum",
    label: "Community Forum",
    icon: MessagesSquare,
    isActive: (p) => p.startsWith("/dashboard/forum"),
  },
  {
    href: "/dashboard/swap-requests",
    label: "Skill Swaps",
    icon: Repeat2,
    isActive: (p) => p.startsWith("/dashboard/swap-requests"),
  },
  {
    href: "/dashboard/admin/notifications",
    label: "Notifications",
    icon: Bell,
    isActive: (p) => p.startsWith("/dashboard/admin/notifications"),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  function NavLink({
    href,
    label,
    Icon,
    active,
  }: {
    href: string;
    label: string;
    Icon: LucideIcon;
    active: boolean;
  }) {
    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`nb-nav-link flex items-center gap-3 px-3.5 py-2.5 text-sm ${
          active ? "active" : ""
        } ${collapsed ? "justify-center" : ""}`}
      >
        <Icon size={19} />
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
      </Link>
    );
  }

  return (
    <aside
      className={`sticky top-5 hidden h-[calc(100vh-2.5rem)] shrink-0 flex-col rounded-3xl bg-white transition-[width] duration-200 lg:flex ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{ boxShadow: "var(--sb-shadow-md)" }}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-7">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2`}>
          <Link href="/dashboard/admin" className="flex min-w-0 items-center gap-2.5">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl">
              <Image src="/images/logo-mark-v2.png" alt="SkillBridge" fill sizes="36px" className="object-cover" priority />
            </span>
            {!collapsed && <span className="truncate text-lg font-extrabold nb-heading">SkillBridge</span>}
          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
              className="nb-icon-btn flex h-8 w-8 shrink-0 items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Expand sidebar"
            className="nb-icon-btn mx-auto mt-4 flex h-8 w-8 items-center justify-center"
          >
            <ChevronRight size={16} />
          </button>
        )}

        <nav className={`mt-6 space-y-1.5 ${collapsed ? "px-0" : ""}`}>
          {TOP_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              href={item.href}
              label={item.label}
              Icon={item.icon}
              active={item.isActive(pathname)}
            />
          ))}
        </nav>

        <div className="mt-6 h-px bg-slate-100" />
        {!collapsed && (
          <p className="mt-4 pl-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Admin Console
          </p>
        )}

        <nav className={`mt-3 space-y-1.5 ${collapsed ? "px-0" : ""}`}>
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              Icon={item.icon}
              active={isAdminNavActive(pathname, item.href)}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}