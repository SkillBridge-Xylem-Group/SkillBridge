"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DASHBOARD_NAV_ITEMS, isDashboardNavActive } from "@/lib/dashboard-nav";
import YourProgress from "./YourProgress";

type SidebarProps = {
  level?: number;
  experiencePoints?: number;
  trustScore?: number | null;
};

const STORAGE_KEY = "skillbridge-sidebar-collapsed";

export default function Sidebar({
  level = 0,
  experiencePoints = 0,
  trustScore = null,
}: SidebarProps) {
  const pathname = usePathname();
  const hideProgress = pathname === "/dashboard/profile";
  const [collapsed, setCollapsed] = useState(false);

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

  return (
    <aside
      className={`hidden shrink-0 flex-col justify-between bg-white transition-[width] duration-200 lg:flex ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{ borderRight: "3px solid var(--neu-ink)" }}
    >
      <div className="px-4 py-7">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2`}>
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[15px] font-extrabold text-white"
              style={{ background: "var(--neu-indigo)", border: "2.5px solid var(--neu-ink)", boxShadow: "3px 3px 0 var(--neu-ink)" }}
            >
              S
            </span>
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
              style={{ color: "var(--neu-ink)" }}
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
            style={{ color: "var(--neu-ink)" }}
          >
            <ChevronRight size={16} />
          </button>
        )}

        <nav className={`mt-8 space-y-1.5 ${collapsed ? "px-0" : ""}`}>
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isDashboardNavActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`nb-nav-link flex items-center gap-3 px-3.5 py-2.5 text-sm ${
                  isActive ? "active" : ""
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon size={19} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {!hideProgress && !collapsed && (
        <div className="px-4 pb-7">
          <YourProgress level={level} experiencePoints={experiencePoints} trustScore={trustScore} />
        </div>
      )}
    </aside>
  );
}
