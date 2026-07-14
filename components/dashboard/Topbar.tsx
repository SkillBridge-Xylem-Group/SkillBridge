"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";

type TopbarProps = {
  userName: string;
  level?: string;
  xp?: number;
};

export default function Topbar({ userName, level = "Level 0", xp = 0 }: TopbarProps) {
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    async function loadUnread() {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setUnreadMessages(data.unreadMessageCount ?? 0);
    }
    loadUnread();
    const interval = setInterval(loadUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-end gap-4 px-6 py-6 sm:px-10">
      <Link
        href="/dashboard/messages"
        aria-label="Messages"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
      >
        <MessageSquare size={20} />
        {unreadMessages > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadMessages > 9 ? "9+" : unreadMessages}
          </span>
        )}
      </Link>
      <NotificationBell />
      <UserMenu name={userName} level={level} xp={xp} />
    </div>
  );
}