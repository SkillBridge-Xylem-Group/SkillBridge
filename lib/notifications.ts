import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationType = "message" | "swap_request" | "swap_response" | "level_up";

export type NotificationRow = {
  notification_id: string;
  type: NotificationType;
  message: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  created_at: string;
  /** Precomputed server-side — message links need the partner's slug, not the thread's uuid. */
  link: string | null;
};

export async function createNotification(
  supabase: SupabaseClient,
  params: { userId: string; type: NotificationType; message: string; relatedEntityType?: string; relatedEntityId?: string }
) {
  await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    message: params.message,
    related_entity_type: params.relatedEntityType ?? null,
    related_entity_id: params.relatedEntityId ?? null,
  });
}

function staticLink(type: NotificationType): string | null {
  switch (type) {
    case "swap_request":
    case "swap_response":
      return "/dashboard/swap-requests";
    case "level_up":
      return "/dashboard/profile";
    default:
      return null;
  }
}

export async function getUserNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 20
): Promise<NotificationRow[]> {
  const { data } = await supabase
    .from("notifications")
    .select("notification_id, type, message, related_entity_type, related_entity_id, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = data ?? [];

  // Message notifications store the thread_id — resolve it to the partner's
  // profile slug so the link matches the /dashboard/messages/[slug] route.
  const messageThreadIds = [...new Set(rows.filter((r) => r.type === "message" && r.related_entity_id).map((r) => r.related_entity_id as string))];
  let slugByThreadId = new Map<string, string>();

  if (messageThreadIds.length > 0) {
    const { data: participants } = await supabase
      .from("thread_participants")
      .select("thread_id, user_id")
      .in("thread_id", messageThreadIds);

    const partnerIdByThread = new Map<string, string>();
    (participants ?? []).forEach((p) => {
      if (p.user_id !== userId) partnerIdByThread.set(p.thread_id, p.user_id);
    });

    const partnerIds = [...new Set(partnerIdByThread.values())];
    const { data: users } = await supabase.from("users").select("id, slug").in("id", partnerIds);
    const slugById = new Map((users ?? []).map((u) => [u.id, u.slug]));

    slugByThreadId = new Map(
      [...partnerIdByThread.entries()].map(([threadId, partnerId]) => [threadId, slugById.get(partnerId) ?? ""])
    );
  }

  return rows.map((r) => ({
    ...r,
    link:
      r.type === "message"
        ? r.related_entity_id && slugByThreadId.get(r.related_entity_id)
          ? `/dashboard/messages/${slugByThreadId.get(r.related_entity_id)}`
          : "/dashboard/messages"
        : staticLink(r.type),
  }));
}

export async function getUnreadNotificationCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("notification_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  return count ?? 0;
}

export async function getUnreadMessageNotificationCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("notification_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "message")
    .eq("is_read", false);
  return count ?? 0;
}

export async function markNotificationRead(supabase: SupabaseClient, notificationId: string) {
  await supabase.from("notifications").update({ is_read: true }).eq("notification_id", notificationId);
}

export async function markAllNotificationsRead(supabase: SupabaseClient, userId: string) {
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
}

/** Clears "new message" notifications for a thread once the viewer has opened it. */
export async function markThreadMessageNotificationsRead(supabase: SupabaseClient, userId: string, threadId: string) {
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("type", "message")
    .eq("related_entity_id", threadId)
    .eq("is_read", false);
}
