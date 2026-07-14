import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  getUnreadMessageNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [notifications, unreadCount, unreadMessageCount] = await Promise.all([
    getUserNotifications(supabase, user.id),
    getUnreadNotificationCount(supabase, user.id),
    getUnreadMessageNotificationCount(supabase, user.id),
  ]);

  return NextResponse.json({ notifications, unreadCount, unreadMessageCount });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  if (typeof body?.notificationId === "string") {
    await markNotificationRead(supabase, body.notificationId);
  } else {
    await markAllNotificationsRead(supabase, user.id);
  }

  return NextResponse.json({ success: true });
}
