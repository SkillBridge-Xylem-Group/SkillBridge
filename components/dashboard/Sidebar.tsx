"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DASHBOARD_NAV_ITEMS, isDashboardNavActive } from "@/lib/dashboard-nav";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { SidebarCommunity } from "@/lib/forumCommunities";
import SidebarCommunities from "./SidebarCommunities";
import { usePendingNav } from "./DashboardChrome";

type SidebarProps = {
  communities?: SidebarCommunity[];
};

const STORAGE_KEY = "skillbridge-sidebar-collapsed";

export default function Sidebar({ communities = [] }: SidebarProps) {
  const pathname = usePathname();
  const { pendingHref, navigate } = usePendingNav();
  const { dictionary } = useLocale();
  const [collapsed, setCollapsed] = useState(false);

  const labels = {
    home: dictionary.nav.home,
    browse: dictionary.nav.browse,
    swaps: dictionary.nav.swaps,
    forum: dictionary.nav.forum,
  } as const;

  // Read the persisted preference after mount only, so server and first
  // client render match (avoids a hydration mismatch) and the sidebar just
  // snaps to the remembered state a beat later instead of flashing.
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

  const activePath = pendingHref ?? pathname;

  return (
    <aside
      className={`sticky top-2 hidden h-[calc(100vh-1rem)] shrink-0 flex-col rounded-2xl bg-white transition-[width] duration-200 lg:flex ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{ boxShadow: "var(--sb-shadow-md)" }}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2`}>
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
            <Image src="/images/logo-mark.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
            {!collapsed && (
              <span className="truncate text-lg font-extrabold nb-heading">SkillBridge</span>
            )}
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

        <nav className={`mt-5 space-y-1 ${collapsed ? "px-0" : ""}`}>
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isDashboardNavActive(activePath, item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                prefetch
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  navigate(item.href);
                }}
                title={collapsed ? labels[item.key] : undefined}
                className={`nb-nav-link flex items-center gap-3 px-3.5 py-2.5 text-sm ${
                  isActive ? "active" : ""
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon size={19} />
                {!collapsed && <span className="flex-1 truncate">{labels[item.key]}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="mt-auto">
            <SidebarCommunities communities={communities} />
          </div>
        )}
      </div>
    </aside>
  );
}
