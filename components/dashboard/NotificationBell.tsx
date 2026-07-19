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
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatRelativeTimeLabel } from "@/lib/i18n/locales";

type NotificationBellProps = {
  notifications: NotificationRow[];
  unreadCount: number;
  onReload: () => Promise<void>;
};

const TYPE_ICONS: Record<NotificationType, { icon: LucideIcon; tone: string }> = {
  message: { icon: MessageCircle, tone: "bg-slate-100 text-slate-600" },
  swap_request: { icon: Repeat, tone: "bg-[var(--sb-teal-light)] text-[var(--sb-teal-dark)]" },
  swap_response: { icon: CalendarCheck, tone: "bg-[var(--sb-teal-light)] text-[var(--sb-teal-dark)]" },
  level_up: { icon: Award, tone: "bg-emerald-50 text-emerald-600" },
  forum_reply: { icon: MessagesSquare, tone: "bg-sky-50 text-sky-600" },
  review_prompt: { icon: Star, tone: "bg-amber-50 text-amber-600" },
  review_received: { icon: Star, tone: "bg-amber-50 text-amber-600" },
};

export default function NotificationBell({ notifications, unreadCount, onReload }: NotificationBellProps) {
  const { locale, dictionary } = useLocale();
  const n = dictionary.notifications;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const preview = notifications.slice(0, 8);

  const typeLabels: Record<NotificationType, string> = {
    message: n.typeMessage,
    swap_request: n.typeSwapRequest,
    swap_response: n.typeSwapUpdate,
    level_up: n.typeLevelUp,
    forum_reply: n.typeForum,
    review_prompt: n.typeReview,
    review_received: n.typeReview,
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleOpenNotification(row: NotificationRow) {
    setOpen(false);
    if (!row.is_read) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: row.notification_id }),
      });
      await onReload();
    }
    if (row.link) router.push(row.link);
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
        aria-label={n.title}
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
              <p className="text-[15px] font-semibold nb-heading">{n.title}</p>
              <p className="text-xs" style={{ color: "var(--sb-muted)" }}>
                {unreadCount > 0 ? interpolate(n.unreadCount, { n: unreadCount }) : n.allCaughtUp}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="rounded-full px-2.5 py-1 text-xs font-semibold transition hover:bg-[var(--sb-emerald-light)] active:scale-95"
                style={{ color: "var(--sb-teal-dark)" }}
              >
                {n.markAllRead}
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
                <p className="text-sm font-medium text-slate-700">{n.empty}</p>
                <p className="mt-1 text-xs text-slate-500">{n.emptyHint}</p>
              </div>
            ) : (
              preview.map((row) => {
                const meta = TYPE_ICONS[row.type] ?? TYPE_ICONS.message;
                const Icon = meta.icon;
                return (
                  <button
                    key={row.notification_id}
                    type="button"
                    onClick={() => handleOpenNotification(row)}
                    className={`flex w-full items-start gap-3 px-3.5 py-3 text-left transition hover:bg-slate-50 active:bg-slate-100/80 ${
                      !row.is_read ? "bg-[var(--sb-emerald-light)]/40" : ""
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
                          {typeLabels[row.type] ?? n.typeMessage}
                        </p>
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {formatRelativeTimeLabel(row.created_at, dictionary.common, locale)}
                        </span>
                      </div>
                      <p
                        className={`mt-0.5 line-clamp-2 text-sm leading-snug ${
                          !row.is_read ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                        }`}
                      >
                        {row.message}
                      </p>
                    </div>

                    {!row.is_read && (
                      <span
                        className="mt-2 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: "var(--sb-emerald)" }}
                        aria-label={dictionary.common.unread}
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
                  {n.viewSwapRequests}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
