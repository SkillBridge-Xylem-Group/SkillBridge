"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createSessionRequest,
  respondToSessionRequest,
  completeSessionRequest,
  cancelSessionRequest,
  rescheduleSessionRequest,
  hideSessionFromHistory,
} from "@/lib/sessionRequests";
import { createNotification } from "@/lib/notifications";
import { awardSessionCompletionXp } from "@/lib/gamification";

async function assertParticipant(supabase: SupabaseClient, requestId: string, userId: string) {
  const { data } = await supabase
    .from("session_requests")
    .select("requester_id, receiver_id, status")
    .eq("request_id", requestId)
    .maybeSingle();

  if (!data) return null;
  if (data.requester_id !== userId && data.receiver_id !== userId) return null;
  return data;
}

export async function sendSwapRequestAction(receiverId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in to send a request." };
  if (user.id === receiverId) return { error: "You can't send a request to yourself." };

  const { data: created, error } = await createSessionRequest(supabase, {
    requesterId: user.id,
    receiverId,
  });

  if (error) return { error: error.message };

  const { data: requesterRow } = await supabase.from("users").select("fullname").eq("id", user.id).maybeSingle();
  await createNotification(supabase, {
    userId: receiverId,
    type: "swap_request",
    message: `${requesterRow?.fullname ?? "Someone"} sent you a swap request`,
    relatedEntityType: "session_request",
    relatedEntityId: created?.request_id,
  });

  revalidatePath("/dashboard/swap-requests");
  return { success: true };
}

export async function respondToRequestAction(requestId: string, status: "accepted" | "declined", scheduledTime?: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };

  const { data: existing } = await supabase
    .from("session_requests")
    .select("requester_id, receiver_id")
    .eq("request_id", requestId)
    .maybeSingle();

  if (!existing || existing.receiver_id !== user.id) {
    return { error: "You can't respond to this request." };
  }

  const { error } = await respondToSessionRequest(supabase, requestId, status, scheduledTime);
  if (error) return { error: error.message };

  const { data: responderRow } = await supabase.from("users").select("fullname").eq("id", user.id).maybeSingle();
  await createNotification(supabase, {
    userId: existing.requester_id,
    type: "swap_response",
    message:
      status === "accepted"
        ? `${responderRow?.fullname ?? "Someone"} accepted your swap request — open Join Session to start`
        : `${responderRow?.fullname ?? "Someone"} declined your swap request`,
    relatedEntityType: "session_request",
    relatedEntityId: requestId,
  });

  revalidatePath("/dashboard/swap-requests");
  revalidatePath(`/dashboard/swap-session/${requestId}`);
  return { success: true };
}

export async function completeSessionAction(requestId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const request = await assertParticipant(supabase, requestId, user.id);
  if (!request) return { error: "You can't update this session." };

  const { error } = await completeSessionRequest(supabase, requestId);
  if (error) return { error: error.message };

  const { data: full } = await supabase
    .from("session_requests")
    .select("requester_id, receiver_id")
    .eq("request_id", requestId)
    .maybeSingle();

  if (full) {
    await Promise.all([
      awardSessionCompletionXp(supabase, full.requester_id),
      awardSessionCompletionXp(supabase, full.receiver_id),
    ]);

    const [{ data: requesterRow }, { data: receiverRow }] = await Promise.all([
      supabase.from("users").select("fullname").eq("id", full.requester_id).maybeSingle(),
      supabase.from("users").select("fullname").eq("id", full.receiver_id).maybeSingle(),
    ]);

    await Promise.all([
      createNotification(supabase, {
        userId: full.requester_id,
        type: "review_prompt",
        message: `Session completed — please rate and review ${receiverRow?.fullname ?? "your partner"}`,
        relatedEntityType: "session_request",
        relatedEntityId: requestId,
      }),
      createNotification(supabase, {
        userId: full.receiver_id,
        type: "review_prompt",
        message: `Session completed — please rate and review ${requesterRow?.fullname ?? "your partner"}`,
        relatedEntityType: "session_request",
        relatedEntityId: requestId,
      }),
    ]);
  }

  revalidatePath("/dashboard/swap-requests");
  revalidatePath(`/dashboard/swap-session/${requestId}`);
  return { success: true };
}

export async function cancelSessionAction(requestId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const request = await assertParticipant(supabase, requestId, user.id);
  if (!request) return { error: "You can't update this session." };

  const { error } = await cancelSessionRequest(supabase, requestId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/swap-requests");
  return { success: true };
}

export async function rescheduleSessionAction(requestId: string, scheduledTime: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const request = await assertParticipant(supabase, requestId, user.id);
  if (!request) return { error: "You can't update this session." };

  const { error } = await rescheduleSessionRequest(supabase, requestId, scheduledTime);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/swap-requests");
  return { success: true };
}

export async function hideSessionHistoryAction(requestId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const { data } = await supabase
    .from("session_requests")
    .select("requester_id, receiver_id, status")
    .eq("request_id", requestId)
    .maybeSingle();

  if (!data) return { error: "Session not found." };
  if (data.requester_id !== user.id && data.receiver_id !== user.id) {
    return { error: "You can't update this session." };
  }

  const historyStatuses = new Set(["completed", "cancelled", "declined"]);
  if (!historyStatuses.has(data.status)) {
    return { error: "Only finished sessions can be removed from history." };
  }

  const { error } = await hideSessionFromHistory(supabase, {
    requestId,
    userId: user.id,
    isRequester: data.requester_id === user.id,
  });

  if (error) {
    if (error.message?.toLowerCase().includes("requester_hidden")) {
      return { error: "History hide needs a database update. Run supabase/session-history-hide.sql." };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard/swap-requests");
  return { success: true };
}