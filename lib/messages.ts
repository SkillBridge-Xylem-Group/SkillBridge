import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type MessageRow = {
  message_id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
};

export type ThreadSummary = {
  thread_id: string;
  partner: { id: string; fullname: string; slug: string; avatar_url: string | null };
  lastMessage: { content: string; sent_at: string; sender_id: string } | null;
};

/** Finds a thread both users already share, or creates a fresh one (and adds both as participants). */
export async function getOrCreateThread(
  supabase: SupabaseClient,
  userId: string,
  otherUserId: string
): Promise<{ threadId: string | null; error: string | null }> {
  if (userId === otherUserId) return { threadId: null, error: "You can't message yourself." };

  const [{ data: mine }, { data: theirs }] = await Promise.all([
    supabase.from("thread_participants").select("thread_id").eq("user_id", userId),
    supabase.from("thread_participants").select("thread_id").eq("user_id", otherUserId),
  ]);

  const mineIds = new Set((mine ?? []).map((r) => r.thread_id));
  const shared = (theirs ?? []).map((r) => r.thread_id).find((id) => mineIds.has(id));
  if (shared) return { threadId: shared, error: null };

  // Generated client-side and inserted without `.select()` — an insert...RETURNING
  // on an RLS-protected table also requires the new row to pass the SELECT policy,
  // which it can't yet (no thread_participants rows exist for it at this point).
  const threadId = randomUUID();
  const { error: threadError } = await supabase.from("message_threads").insert({ thread_id: threadId });

  if (threadError) {
    return { threadId: null, error: threadError.message };
  }

  // Inserted one at a time: the participants policy only allows adding yourself,
  // or adding someone else once you're already a participant of that thread —
  // so the caller's own row has to land first.
  const { error: selfError } = await supabase
    .from("thread_participants")
    .insert({ thread_id: threadId, user_id: userId });
  if (selfError) return { threadId: null, error: selfError.message };

  const { error: participantsError } = await supabase
    .from("thread_participants")
    .insert({ thread_id: threadId, user_id: otherUserId });

  if (participantsError) return { threadId: null, error: participantsError.message };
  return { threadId, error: null };
}

/** Permanently deletes a thread and everything in it (both participants lose access). */
export async function deleteThread(supabase: SupabaseClient, threadId: string): Promise<{ error: string | null }> {
  const { error: messagesError } = await supabase.from("messages").delete().eq("thread_id", threadId);
  if (messagesError) return { error: messagesError.message };

  const { error: participantsError } = await supabase.from("thread_participants").delete().eq("thread_id", threadId);
  if (participantsError) return { error: participantsError.message };

  const { error: threadError } = await supabase.from("message_threads").delete().eq("thread_id", threadId);
  if (threadError) return { error: threadError.message };

  return { error: null };
}

/** Returns the partner's id/name/slug if `viewerId` is a participant of the thread, else null. */
export async function getThreadParticipant(
  supabase: SupabaseClient,
  threadId: string,
  viewerId: string
): Promise<{ id: string; fullname: string; slug: string; avatar_url: string | null } | null> {
  const { data: participants } = await supabase
    .from("thread_participants")
    .select("user_id")
    .eq("thread_id", threadId);

  const ids = (participants ?? []).map((p) => p.user_id);
  if (!ids.includes(viewerId)) return null;

  const partnerId = ids.find((id) => id !== viewerId);
  if (!partnerId) return null;

  const { data: partner } = await supabase
    .from("users")
    .select("id, fullname, slug, avatar_url")
    .eq("id", partnerId)
    .maybeSingle();
  return partner ?? null;
}

/** Looks up a user by their profile slug (for slug-based message URLs). */
export async function getUserBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<{ id: string; fullname: string; slug: string; avatar_url: string | null } | null> {
  const { data } = await supabase.from("users").select("id, fullname, slug, avatar_url").eq("slug", slug).maybeSingle();
  return data ?? null;
}

export async function getThreadMessages(supabase: SupabaseClient, threadId: string): Promise<MessageRow[]> {
  const { data } = await supabase
    .from("messages")
    .select("message_id, thread_id, sender_id, content, sent_at")
    .eq("thread_id", threadId)
    .order("sent_at", { ascending: true });
  return data ?? [];
}

export async function getUserThreads(supabase: SupabaseClient, userId: string): Promise<ThreadSummary[]> {
  const { data: participantRows } = await supabase
    .from("thread_participants")
    .select("thread_id")
    .eq("user_id", userId);

  const threadIds = [...new Set((participantRows ?? []).map((r) => r.thread_id))];
  if (threadIds.length === 0) return [];

  const { data: allParticipants } = await supabase
    .from("thread_participants")
    .select("thread_id, user_id")
    .in("thread_id", threadIds);

  const partnerIdByThread = new Map<string, string>();
  (allParticipants ?? []).forEach((p) => {
    if (p.user_id !== userId) partnerIdByThread.set(p.thread_id, p.user_id);
  });

  const partnerIds = [...new Set(partnerIdByThread.values())];
  const { data: users } = await supabase.from("users").select("id, fullname, slug, avatar_url").in("id", partnerIds);
  const userById = new Map((users ?? []).map((u) => [u.id, u]));

  const { data: messages } = await supabase
    .from("messages")
    .select("thread_id, sender_id, content, sent_at")
    .in("thread_id", threadIds)
    .order("sent_at", { ascending: false });

  const lastByThread = new Map<string, { content: string; sent_at: string; sender_id: string }>();
  (messages ?? []).forEach((m) => {
    if (!lastByThread.has(m.thread_id)) lastByThread.set(m.thread_id, m);
  });

  return threadIds
    .map((threadId) => {
      const partnerId = partnerIdByThread.get(threadId) ?? "";
      const partnerUser = userById.get(partnerId);
      return {
        thread_id: threadId,
        partner: {
          id: partnerId,
          fullname: partnerUser?.fullname ?? "Unknown",
          slug: partnerUser?.slug ?? "",
          avatar_url: partnerUser?.avatar_url ?? null,
        },
        lastMessage: lastByThread.get(threadId) ?? null,
      };
    })
    .sort((a, b) => (b.lastMessage?.sent_at ?? "").localeCompare(a.lastMessage?.sent_at ?? ""));
}