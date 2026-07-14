"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, MessageSquare } from "lucide-react";
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
};

export default function Topbar({
  userName,
  level = "Level 0",
  xp = 0,
  levelNumber = 0,
  trustScore = null,
}: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { notifications, unreadCount, unreadMessageCount, reload } = useRealtimeNotifications();

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-100/80 bg-[#F7F7FB]/95 px-4 py-3 backdrop-blur sm:px-8 lg:justify-end lg:border-0 lg:bg-transparent lg:px-10 lg:py-6 lg:backdrop-blur-none">
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <Menu size={22} />
          </button>
          <Link href="/dashboard" className="inline-flex min-w-0 items-center gap-2">
            <Image
              src="/images/logo-mark.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0"
            />
            <span className="truncate text-base font-extrabold text-brand">SkillBridge</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/dashboard/messages"
            aria-label="Messages"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <MessageSquare size={20} />
            {unreadMessageCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
              </span>
            )}
          </Link>
          <NotificationBell notifications={notifications} unreadCount={unreadCount} onReload={reload} />
          <UserMenu name={userName} level={level} xp={xp} />
        </div>
      </div>

      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        level={levelNumber}
        experiencePoints={xp}
        trustScore={trustScore}
      />
    </>
  );
}
