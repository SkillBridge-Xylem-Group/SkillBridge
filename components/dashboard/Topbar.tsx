"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, MessageSquare } from "lucide-react";
import type { SidebarCommunity } from "@/lib/forumCommunities";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";
import { MobileNavDrawer } from "./MobileNav";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useTopbarLeading } from "./TopbarLeading";

type TopbarProps = {
  userName: string;
  avatarUrl?: string | null;
  communities?: SidebarCommunity[];
};

export default function Topbar({ userName, avatarUrl = null, communities = [] }: TopbarProps) {
  const { dictionary } = useLocale();
  const leading = useTopbarLeading();
  const [menuOpen, setMenuOpen] = useState(false);
  const { notifications, unreadCount, unreadMessageCount, reload } = useRealtimeNotifications();

  return (
    <>
      <div
        className={`sticky top-0 z-30 flex shrink-0 items-center gap-3 bg-white/90 px-4 py-2.5 backdrop-blur-sm sm:px-6 lg:mb-0 lg:bg-[var(--sb-bg)]/90 lg:px-0 lg:py-2 ${
          leading ? "justify-between" : "justify-between lg:justify-end"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {leading ? <div className="shrink-0">{leading}</div> : null}
          <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <button
            type="button"
            aria-label={dictionary.nav.openNavigationMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          <Link href="/dashboard" className="inline-flex min-w-0 items-center gap-2">
            <Image
              src="/images/logo-mark-v2.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0"
            />
            <span className="truncate text-base font-extrabold nb-heading">SkillBridge</span>
          </Link>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/messages"
            aria-label={dictionary.messages.title}
            className="nb-icon-btn relative flex h-10 w-10 items-center justify-center"
          >
            <MessageSquare size={19} />
            {unreadMessageCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white"
                style={{ background: "#f43f5e" }}
              >
                {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
              </span>
            )}
          </Link>
          <NotificationBell notifications={notifications} unreadCount={unreadCount} onReload={reload} />
          <UserMenu name={userName} avatarUrl={avatarUrl} />
        </div>
      </div>

      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} communities={communities} />
    </>
  );
}
