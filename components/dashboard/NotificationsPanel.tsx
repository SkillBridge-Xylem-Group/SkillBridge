"use client";

import { useRouter } from "next/navigation";
import { CalendarCheck, Award, MessageCircle, Repeat, MessagesSquare, Star, type LucideIcon } from "lucide-react";
import type { NotificationRow, NotificationType } from "@/lib/notifications";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

const ICONS: Record<NotificationType, { icon: LucideIcon; bg: string; color: string; label: string }> = {
  message: { icon: MessageCircle, bg: "bg-slate-100", color: "text-slate-500", label: "Message" },
  swap_request: { icon: Repeat, bg: "bg-brand-light", color: "text-brand", label: "Swap request" },
  swap_response: { icon: CalendarCheck, bg: "bg-brand-light", color: "text-brand", label: "Swap update" },
  level_up: { icon: Award, bg: "bg-emerald-50", color: "text-emerald-500", label: "Level up" },
  forum_reply: { icon: MessagesSquare, bg: "bg-sky-50", color: "text-sky-500", label: "Forum" },
  review_prompt: { icon: Star, bg: "bg-amber-50", color: "text-amber-500", label: "Review" },
  review_received: { icon: Star, bg: "bg-amber-50", color: "text-amber-600", label: "Review" },
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

export default function NotificationsPanel() {
  const { notifications, unreadCount, reload, setNotifications, setUnreadCount } = useRealtimeNotifications();
  const router = useRouter();
  const preview = notifications.slice(0, 5);

  async function handleClick(n: NotificationRow) {
    if (!n.is_read) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: n.notification_id }),
      });
      setNotifications((prev) =>
        prev.map((x) => (x.notification_id === n.notification_id ? { ...x, is_read: true } : x))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      await reload();
    }
    if (n.link) router.push(n.link);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Notifications</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">{unreadCount} new</span>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        {preview.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">You&apos;re all caught up.</p>
        ) : (
          preview.map((n) => {
            const { icon: Icon, bg, color, label } = ICONS[n.type] ?? ICONS.message;
            return (
              <button
                key={n.notification_id}
                type="button"
                onClick={() => handleClick(n)}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 active:scale-[0.99] ${
                  !n.is_read ? "bg-brand-light/70" : ""
                }`}
              >
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                    <span className="text-[11px] text-slate-400">{formatRelativeTime(n.created_at)}</span>
                  </div>
                  <p
                    className={`mt-0.5 line-clamp-2 text-sm leading-snug ${
                      !n.is_read ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                    }`}
                  >
                    {n.message}
                  </p>
                </div>
                {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
