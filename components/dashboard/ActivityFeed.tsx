"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Award,
  MessageCircle,
  Repeat,
  MessagesSquare,
  Star,
  Video,
  PhoneOff,
  type LucideIcon,
} from "lucide-react";
import type { NotificationRow, NotificationType } from "@/lib/notifications";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { formatRelativeTimeLabel } from "@/lib/i18n/locales";

const ICONS: Record<NotificationType, { icon: LucideIcon; bg: string; color: string }> = {
  message: { icon: MessageCircle, bg: "var(--sb-tint-violet-bg)", color: "var(--sb-tint-violet-ink)" },
  swap_request: { icon: Repeat, bg: "var(--sb-teal-light)", color: "var(--sb-teal-dark)" },
  swap_response: { icon: CalendarCheck, bg: "var(--sb-teal-light)", color: "var(--sb-teal-dark)" },
  level_up: { icon: Award, bg: "var(--sb-emerald-light)", color: "var(--sb-emerald-dark)" },
  forum_reply: { icon: MessagesSquare, bg: "var(--sb-tint-blue-bg)", color: "var(--sb-tint-blue-ink)" },
  review_prompt: { icon: Star, bg: "var(--sb-tint-amber-bg)", color: "var(--sb-tint-amber-ink)" },
  review_received: { icon: Star, bg: "var(--sb-tint-amber-bg)", color: "var(--sb-tint-amber-ink)" },
  session_started: { icon: Video, bg: "var(--sb-emerald-light)", color: "var(--sb-emerald-dark)" },
  session_ended: { icon: PhoneOff, bg: "var(--sb-tint-rose-bg)", color: "var(--sb-tint-rose-ink)" },
};

/**
 * Compact read-only feed of the signed-in user's own recent activity.
 * Deliberately does a plain one-time fetch (not useRealtimeNotifications) —
 * the notification bell already holds the live Supabase Realtime
 * subscription for this user, and Supabase only allows one `.on()` +
 * `.subscribe()` registration per channel name. A second component opening
 * the same `notifications:${userId}` channel throws "cannot add
 * postgres_changes callbacks ... after subscribe()". This widget just
 * reads the same /api/notifications endpoint on mount + manual refresh.
 */
export default function ActivityFeed() {
  const { locale, dictionary } = useLocale();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) throw new Error("Failed to load activity");
        const data = await res.json();
        if (!cancelled) setNotifications(data.notifications ?? []);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const items = notifications.slice(0, 6);

  return (
    <div className="nb-card p-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: "var(--sb-muted)" }}>
          Activity Feed
        </h2>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setError(false);
            setRefreshKey((k) => k + 1);
          }}
          className="text-sm font-bold hover:underline"
          style={{ color: "var(--sb-teal-dark)" }}
        >
          Refresh
        </button>
      </div>

      <div className="mt-2 space-y-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3 rounded-xl px-2 py-3">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="py-6 text-center text-sm text-red-600">Couldn&apos;t load activity.</div>
        ) : items.length === 0 ? (
          <div className="py-6 text-center text-sm" style={{ color: "var(--sb-muted)" }}>
            Nothing yet — your activity will show up here.
          </div>
        ) : (
          items.map((row, index) => {
            const { icon: Icon, bg, color } = ICONS[row.type] ?? ICONS.message;
            return (
              <div
                key={row.notification_id}
                className="flex items-start gap-3 rounded-xl px-2 py-3"
                style={index > 0 ? { borderTop: "2px solid #f0ecfa" } : undefined}
              >
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: bg, color }}
                >
                  <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug" style={{ color: "var(--sb-ink)" }}>
                    {row.message}
                  </p>
                  <p className="mt-0.5 text-xs font-medium" style={{ color: "var(--sb-muted)" }}>
                    {formatRelativeTimeLabel(row.created_at, dictionary.common, locale)}
                  </p>
                </div>
                {!row.is_read && (
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: "var(--sb-emerald)" }}
                    aria-label={dictionary.common.unread}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
