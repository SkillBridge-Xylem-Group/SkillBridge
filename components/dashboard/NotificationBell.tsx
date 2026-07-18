"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarCheck,
  Award,
  MessageCircle,
  Repeat,
  MessagesSquare,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { NotificationRow, NotificationType } from "@/lib/notifications";

type NotificationBellProps = {
  notifications: NotificationRow[];
  unreadCount: number;
  onReload: () => Promise<void>;
};

const TYPE_META: Record<NotificationType, { icon: LucideIcon; label: string; tone: string }> = {
  message: { icon: MessageCircle, label: "Message", tone: "bg-slate-100 text-slate-600" },
  swap_request: { icon: Repeat, label: "Swap request", tone: "bg-[var(--sb-teal-light)] text-[var(--sb-teal-dark)]" },
  swap_response: { icon: CalendarCheck, label: "Swap update", tone: "bg-[var(--sb-teal-light)] text-[var(--sb-teal-dark)]" },
  level_up: { icon: Award, label: "Level up", tone: "bg-emerald-50 text-emerald-600" },
  forum_reply: { icon: MessagesSquare, label: "Forum", tone: "bg-sky-50 text-sky-600" },
  review_prompt: { icon: Star, label: "Review", tone: "bg-amber-50 text-amber-600" },
  review_received: { icon: Star, label: "Review", tone: "bg-amber-50 text-amber-600" },
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return "";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationBell({ notifications, unreadCount, onReload }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const preview = notifications.slice(0, 8);

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
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`nb-icon-btn relative flex h-10 w-10 items-center justify-center ${open ? "-translate-y-0.5" : ""}`}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white"
            style={{ background: "#f43f5e" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="nb-card absolute right-0 z-30 mt-2 w-[min(22.5rem,calc(100vw-1.25rem))] overflow-hidden !rounded-2xl bg-white">
          <div className="flex items-center justify-between gap-3 px-4 pb-2.5 pt-3.5">
            <div>
              <p className="text-[15px] font-semibold nb-heading">Notifications</p>
              <p className="text-xs" style={{ color: "var(--sb-muted)" }}>
                {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="rounded-full px-2.5 py-1 text-xs font-semibold transition hover:bg-[var(--sb-emerald-light)] active:scale-95"
                style={{ color: "var(--sb-teal-dark)" }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="mx-3 h-px bg-slate-100" />

          <div className="max-h-[22rem] overflow-y-auto py-1.5">
            {preview.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Bell size={22} />
                </div>
                <p className="text-sm font-medium text-slate-700">No notifications yet</p>
                <p className="mt-1 text-xs text-slate-500">Swap requests and messages will show up here.</p>
              </div>
            ) : (
              preview.map((n) => {
                const meta = TYPE_META[n.type] ?? TYPE_META.message;
                const Icon = meta.icon;
                return (
                  <button
                    key={n.notification_id}
                    type="button"
                    onClick={() => handleOpenNotification(n)}
                    className={`flex w-full items-start gap-3 px-3.5 py-3 text-left transition hover:bg-slate-50 active:bg-slate-100/80 ${
                      !n.is_read ? "bg-[var(--sb-emerald-light)]/40" : ""
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.tone}`}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          {meta.label}
                        </p>
                        <span className="shrink-0 text-[11px] text-slate-400">{formatRelativeTime(n.created_at)}</span>
                      </div>
                      <p
                        className={`mt-0.5 line-clamp-2 text-sm leading-snug ${
                          !n.is_read ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                        }`}
                      >
                        {n.message}
                      </p>
                    </div>

                    {!n.is_read && (
                      <span
                        className="mt-2 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: "var(--sb-emerald)" }}
                        aria-label="Unread"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {preview.length > 0 && (
            <>
              <div className="mx-3 h-px bg-slate-100" />
              <div className="p-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push("/dashboard/swap-requests");
                  }}
                  className="w-full rounded-xl py-2.5 text-center text-sm font-semibold transition hover:bg-[var(--sb-emerald-light)] active:scale-[0.99]"
                  style={{ color: "var(--sb-teal-dark)" }}
                >
                  View swap requests
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
