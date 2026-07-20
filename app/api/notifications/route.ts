import { type NextRequest, NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  getUnreadMessageNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";

export async function GET() {
  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const [notifications, unreadCount, unreadMessageCount] = await Promise.all([
    getUserNotifications(supabase, user.id),
    getUnreadNotificationCount(supabase, user.id),
    getUnreadMessageNotificationCount(supabase, user.id),
  ]);

  return NextResponse.json({ notifications, unreadCount, unreadMessageCount });
}

export async function PATCH(req: NextRequest) {
  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const body = await req.json().catch(() => ({}));

  if (typeof body?.notificationId === "string") {
    await markNotificationRead(supabase, body.notificationId);
  } else {
    await markAllNotificationsRead(supabase, user.id);
  }

  return NextResponse.json({ success: true });
}
