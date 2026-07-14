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
};

/** Derives where clicking a notification should navigate to (there's no stored link column). */
export function notificationLink(n: Pick<NotificationRow, "type" | "related_entity_id">): string | null {
  switch (n.type) {
    case "message":
      return n.related_entity_id ? `/dashboard/messages/${n.related_entity_id}` : "/dashboard/messages";
    case "swap_request":
    case "swap_response":
      return "/dashboard/swap-requests";
    case "level_up":
      return "/dashboard/profile";
    default:
      return null;
  }
}

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
  return data ?? [];
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
