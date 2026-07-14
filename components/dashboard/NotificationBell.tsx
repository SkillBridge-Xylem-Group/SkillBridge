"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import type { NotificationRow } from "@/lib/notifications";

type NotificationBellProps = {
  notifications: NotificationRow[];
  unreadCount: number;
  onReload: () => Promise<void>;
};

export default function NotificationBell({ notifications, unreadCount, onReload }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleOpenNotification(n: NotificationRow) {
    setOpen(false);
    if (!n.is_read) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: n.notification_id }),
      });
      await onReload();
    }
    if (n.link) router.push(n.link);
  }

  async function handleMarkAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    await onReload();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">Notifications</p>
            {unreadCount > 0 && (
              <button type="button" onClick={handleMarkAllRead} className="text-xs font-semibold text-brand hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.notification_id}
                  type="button"
                  onClick={() => handleOpenNotification(n)}
                  className={`flex w-full flex-col gap-0.5 border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50 ${
                    !n.is_read ? "bg-brand-light/40" : ""
                  }`}
                >
                  <p className="text-sm font-bold text-slate-900">{n.message}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
