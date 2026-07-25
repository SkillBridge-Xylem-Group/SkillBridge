import { type NextRequest, NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import {
  ACTION_RATE_LIMITS,
  actionRateLimitError,
  checkUserActionRateLimit,
} from "@/lib/auth/action-rate-limit";
import { getThreadParticipant, getThreadMessages } from "@/lib/messages";
import { createNotification, markThreadMessageNotificationsRead } from "@/lib/notifications";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const partner = await getThreadParticipant(supabase, threadId, user.id);
  if (!partner) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  await markThreadMessageNotificationsRead(supabase, user.id, threadId);
  const messages = await getThreadMessages(supabase, threadId);
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const partner = await getThreadParticipant(supabase, threadId, user.id);
  if (!partner) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const messageLimit = await checkUserActionRateLimit(
    ACTION_RATE_LIMITS.messageSend.bucket,
    user.id,
    ACTION_RATE_LIMITS.messageSend.max,
    ACTION_RATE_LIMITS.messageSend.windowMs
  );
  if (!messageLimit.allowed) {
    return NextResponse.json({ error: actionRateLimitError(messageLimit.retryAfterMs) }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json({ error: "Message can't be empty" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 });
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({ thread_id: threadId, sender_id: user.id, content })
    .select("message_id, thread_id, sender_id, content, sent_at")
    .single();

  if (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  const { data: senderRow } = await supabase.from("users").select("fullname").eq("id", user.id).maybeSingle();
  await createNotification(supabase, {
    userId: partner.id,
    type: "message",
    message: `New message from ${senderRow?.fullname ?? "someone"}: ${content.slice(0, 140)}`,
    relatedEntityType: "message_thread",
    relatedEntityId: threadId,
  });

  return NextResponse.json({ message });
}
