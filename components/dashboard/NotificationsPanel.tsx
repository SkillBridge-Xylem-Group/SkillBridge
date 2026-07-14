"use client";

import { useRouter } from "next/navigation";
import { CalendarCheck, Award, MessageCircle, Repeat, MessagesSquare, Star, type LucideIcon } from "lucide-react";
import type { NotificationRow, NotificationType } from "@/lib/notifications";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

const ICONS: Record<NotificationType, { icon: LucideIcon; bg: string; color: string }> = {
  message: { icon: MessageCircle, bg: "bg-slate-100", color: "text-slate-500" },
  swap_request: { icon: Repeat, bg: "bg-brand-light", color: "text-brand" },
  swap_response: { icon: CalendarCheck, bg: "bg-brand-light", color: "text-brand" },
  level_up: { icon: Award, bg: "bg-emerald-50", color: "text-emerald-500" },
  forum_reply: { icon: MessagesSquare, bg: "bg-violet-50", color: "text-violet-500" },
  review_prompt: { icon: Star, bg: "bg-amber-50", color: "text-amber-500" },
  review_received: { icon: Star, bg: "bg-amber-50", color: "text-amber-600" },
};

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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">Notifications</h2>
        {unreadCount > 0 && (
          <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">{unreadCount} NEW</span>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {preview.length === 0 ? (
          <p className="text-sm text-slate-500">You&apos;re all caught up.</p>
        ) : (
          preview.map((n) => {
            const { icon: Icon, bg, color } = ICONS[n.type] ?? ICONS.message;
            return (
              <button
                key={n.notification_id}
                type="button"
                onClick={() => handleClick(n)}
                className={`flex w-full gap-3 rounded-xl p-3 text-left ${
                  !n.is_read ? "border-l-4 border-brand bg-brand-light" : "hover:bg-slate-50"
                }`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{n.message}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
