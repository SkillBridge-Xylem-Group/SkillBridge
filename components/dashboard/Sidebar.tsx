"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV_ITEMS, isDashboardNavActive } from "@/lib/dashboard-nav";
import YourProgress from "./YourProgress";

type SidebarProps = {
  level?: number;
  experiencePoints?: number;
  trustScore?: number | null;
};

export default function Sidebar({
  level = 0,
  experiencePoints = 0,
  trustScore = null,
}: SidebarProps) {
  const pathname = usePathname();
  const hideProgress = pathname === "/dashboard/profile";

  return (
    <aside className="hidden w-56 shrink-0 flex-col justify-between border-r border-slate-100 bg-white px-6 py-8 lg:flex">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2">
          <Image
            src="/images/logo-mark.png"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0"
          />
          <span className="text-xl font-extrabold text-brand">SkillBridge</span>
        </Link>
        <nav className="mt-10 space-y-1">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isDashboardNavActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-brand-light text-brand" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      {!hideProgress && (
        <YourProgress level={level} experiencePoints={experiencePoints} trustScore={trustScore} />
      )}
    </aside>
  );
}
