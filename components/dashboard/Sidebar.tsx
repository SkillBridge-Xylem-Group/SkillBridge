"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV_ITEMS, isDashboardNavActive } from "@/lib/dashboard-nav";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { SidebarCommunity } from "@/lib/forumCommunities";
import YourProgress from "./YourProgress";
import SidebarCommunities from "./SidebarCommunities";

type SidebarProps = {
  level?: number;
  experiencePoints?: number;
  trustScore?: number | null;
  communities?: SidebarCommunity[];
};

export default function Sidebar({
  level = 0,
  experiencePoints = 0,
  trustScore = null,
  communities = [],
}: SidebarProps) {
  const pathname = usePathname();
  const hideProgress = pathname === "/dashboard/profile";
  const { dictionary } = useLocale();

  const labels = {
    home: dictionary.nav.home,
    browse: dictionary.nav.browse,
    swaps: dictionary.nav.swaps,
    forum: dictionary.nav.forum,
    profile: dictionary.nav.profile,
  } as const;

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-100 bg-white lg:flex">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-8">
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
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-brand-light text-brand" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{labels[item.key]}</span>
              </Link>
            );
          })}
        </nav>

        <SidebarCommunities communities={communities} />
      </div>

      {!hideProgress && (
        <div className="shrink-0 border-t border-slate-100 px-6 py-5">
          <YourProgress level={level} experiencePoints={experiencePoints} trustScore={trustScore} />
        </div>
      )}
    </aside>
  );
}
