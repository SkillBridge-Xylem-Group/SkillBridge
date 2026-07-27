"use client";

import { useRouter } from "next/navigation";
import { CalendarCheck, Award, MessageCircle, Repeat, MessagesSquare, Star, Video, PhoneOff, X, type LucideIcon } from "lucide-react";
import type { NotificationRow, NotificationType } from "@/lib/notifications";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatRelativeTimeLabel } from "@/lib/i18n/locales";

const ICONS: Record<NotificationType, { icon: LucideIcon; bg: string; color: string }> = {
  message: { icon: MessageCircle, bg: "bg-slate-100", color: "text-slate-500" },
  swap_request: { icon: Repeat, bg: "bg-brand-light", color: "text-brand" },
  swap_response: { icon: CalendarCheck, bg: "bg-brand-light", color: "text-brand" },
  level_up: { icon: Award, bg: "bg-emerald-50", color: "text-emerald-500" },
  forum_reply: { icon: MessagesSquare, bg: "bg-sky-50", color: "text-sky-500" },
  review_prompt: { icon: Star, bg: "bg-amber-50", color: "text-amber-500" },
  review_received: { icon: Star, bg: "bg-amber-50", color: "text-amber-600" },
  session_started: { icon: Video, bg: "bg-emerald-50", color: "text-emerald-500" },
  session_ended: { icon: PhoneOff, bg: "bg-slate-100", color: "text-slate-500" },
};

export default function NotificationsPanel() {
  const { locale, dictionary } = useLocale();
  const n = dictionary.notifications;
  const { notifications, unreadCount, reload, setNotifications, setUnreadCount } = useRealtimeNotifications();
  const router = useRouter();
  const preview = notifications.slice(0, 5);

  const typeLabels: Record<NotificationType, string> = {
    message: n.typeMessage,
    swap_request: n.typeSwapRequest,
    swap_response: n.typeSwapUpdate,
    level_up: n.typeLevelUp,
    forum_reply: n.typeForum,
    review_prompt: n.typeReview,
    review_received: n.typeReview,
    session_started: n.typeSessionStarted,
    session_ended: n.typeSessionEnded,
  };

  async function handleClick(row: NotificationRow) {
    if (!row.is_read) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: row.notification_id }),
      });
      setNotifications((prev) =>
        prev.map((x) => (x.notification_id === row.notification_id ? { ...x, is_read: true } : x))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      await reload();
    }
    if (row.link) router.push(row.link);
  }

  async function handleDelete(e: React.MouseEvent, row: NotificationRow) {
    e.stopPropagation();
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: row.notification_id }),
    });
    setNotifications((prev) => prev.filter((x) => x.notification_id !== row.notification_id));
    if (!row.is_read) setUnreadCount((c) => Math.max(0, c - 1));
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold nb-heading">{n.title}</h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--neu-text-muted)" }}>
            {unreadCount > 0 ? interpolate(n.unreadCount, { n: unreadCount }) : n.allCaughtUp}
          </p>
        </div>
        {unreadCount > 0 && (
          <span
            className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
            style={{ background: "var(--neu-indigo)", border: "2px solid var(--neu-ink)" }}
          >
            {interpolate(n.newCount, { n: unreadCount })}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        {preview.length === 0 ? (
          <p className="rounded-xl px-3 py-4 text-sm" style={{ background: "#fbfaff", color: "var(--neu-text-muted)" }}>{n.allCaughtUp}</p>
        ) : (
          preview.map((row) => {
            const { icon: Icon, bg, color } = ICONS[row.type] ?? ICONS.message;
            const label = typeLabels[row.type] ?? typeLabels.message;
            return (
              <div
                key={row.notification_id}
                className={`group flex w-full items-start gap-1 rounded-xl px-3 py-3 transition hover:bg-slate-50 ${
                  !row.is_read ? "bg-[#f3eefc]" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleClick(row)}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left active:scale-[0.99]"
                >
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--neu-text-muted)" }}>{label}</p>
                      <span className="text-[11px]" style={{ color: "var(--neu-text-muted)" }}>
                        {formatRelativeTimeLabel(row.created_at, dictionary.common, locale)}
                      </span>
                    </div>
                    <p
                      className="mt-0.5 line-clamp-2 text-sm leading-snug"
                      style={{ color: "var(--neu-ink)", fontWeight: !row.is_read ? 600 : 500 }}
                    >
                      {row.message}
                    </p>
                  </div>
                  {!row.is_read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--neu-indigo)" }} aria-label={dictionary.common.unread} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDelete(e, row)}
                  aria-label={n.deleteNotification}
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition hover:bg-slate-200"
                  style={{ color: "var(--neu-text-muted)" }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
