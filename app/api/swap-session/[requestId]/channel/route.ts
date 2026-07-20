import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import {
  signSwapChannelToken,
  swapChannelName,
  swapChannelTtlMs,
} from "@/lib/security";

type RouteParams = { params: Promise<{ requestId: string }> };

/**
 * Issues a short-lived Realtime channel topic for an authenticated session participant.
 * Prevents eavesdropping on `swap-session:{requestId}` by outsiders who know the id.
 */
export async function POST(_req: Request, { params }: RouteParams) {
  const { requestId } = await params;
  if (!requestId || !/^[0-9a-f-]{36}$/i.test(requestId)) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const { data: session } = await supabase
    .from("session_requests")
    .select("request_id, requester_id, receiver_id, status")
    .eq("request_id", requestId)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const isParticipant = session.requester_id === user.id || session.receiver_id === user.id;
  if (!isParticipant) {
    return NextResponse.json({ error: "Not a participant." }, { status: 403 });
  }

  if (!["accepted", "rescheduled", "completed"].includes(session.status)) {
    return NextResponse.json({ error: "Session is not joinable." }, { status: 403 });
  }

  const expiresAt = Date.now() + swapChannelTtlMs();
  const token = signSwapChannelToken(requestId, expiresAt);
  const channel = swapChannelName(requestId, token);

  return NextResponse.json({ channel, token, expiresAt });
}
