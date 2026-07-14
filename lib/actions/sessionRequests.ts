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
} from "@/lib/sessionRequests";

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

  const { error } = await createSessionRequest(supabase, {
    requesterId: user.id,
    receiverId,
  });

  if (error) return { error: error.message };

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
    .select("receiver_id")
    .eq("request_id", requestId)
    .maybeSingle();

  if (!existing || existing.receiver_id !== user.id) {
    return { error: "You can't respond to this request." };
  }

  const { error } = await respondToSessionRequest(supabase, requestId, status, scheduledTime);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/swap-requests");
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

  revalidatePath("/dashboard/swap-requests");
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