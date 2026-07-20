"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/lib/notifications";

type NotificationsPayload = {
  notifications: NotificationRow[];
  unreadCount: number;
  unreadMessageCount: number;
};

/**
 * Loads notifications once, then keeps them fresh via Supabase Realtime
 * (with a slow poll fallback if realtime is unavailable).
 */
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = (await res.json()) as NotificationsPayload;
    setNotifications(data.notifications ?? []);
    setUnreadCount(data.unreadCount ?? 0);
    setUnreadMessageCount(data.unreadMessageCount ?? 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]> | null = null;
    let pollId: ReturnType<typeof setInterval> | null = null;

    function onFocus() {
      void load();
    }
    function onVisible() {
      if (document.visibilityState === "visible") void load();
    }

    async function setup() {
      await load();
      if (cancelled) return;

      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        channel = supabase
          .channel(`notifications:${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              void load();
            }
          )
          .subscribe();
      } catch (err) {
        console.error("[notifications] realtime setup failed:", err);
      }

      window.addEventListener("focus", onFocus);
      document.addEventListener("visibilitychange", onVisible);
      pollId = setInterval(() => {
        void load();
      }, 15_000);
    }

    void setup();

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      if (pollId) clearInterval(pollId);
      if (channel) {
        const supabase = createSupabaseBrowserClient();
        void supabase.removeChannel(channel);
      }
    };
  }, [load]);

  return {
    notifications,
    unreadCount,
    unreadMessageCount,
    reload: load,
    setNotifications,
    setUnreadCount,
  };
}