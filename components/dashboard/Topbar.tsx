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

type TopbarProps = {
  userName: string;
  level?: string;
  xp?: number;
  levelNumber?: number;
  trustScore?: number | null;
  communities?: SidebarCommunity[];
};

export default function Topbar({
  userName,
  level = "Level 0",
  xp = 0,
  levelNumber = 0,
  trustScore = null,
  communities = [],
}: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { notifications, unreadCount, unreadMessageCount, reload } = useRealtimeNotifications();

  return (
    <>
      <div className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-1.5 sm:px-8 lg:justify-end lg:px-10 lg:py-1.5">
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          <Link href="/dashboard" className="inline-flex min-w-0 items-center gap-2">
            <Image
              src="/images/logo-mark.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0"
            />
            <span className="truncate text-base font-extrabold text-brand">SkillBridge</span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <Link
            href="/dashboard/messages"
            aria-label="Messages"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 active:scale-95"
          >
            <MessageSquare size={20} />
            {unreadMessageCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
              </span>
            )}
          </Link>
          <NotificationBell notifications={notifications} unreadCount={unreadCount} onReload={reload} />
          <UserMenu name={userName} />
        </div>
      </div>

      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        level={levelNumber}
        experiencePoints={xp}
        trustScore={trustScore}
        communities={communities}
      />
    </>
  );
}
