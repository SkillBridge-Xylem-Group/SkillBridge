import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserSkills } from "@/lib/skillCatalog";
import { getReviewedSessionIds } from "@/lib/reviews";
import type { Skill } from "@/lib/types/profile";

export type SessionStatus = "pending" | "accepted" | "declined" | "rescheduled" | "completed" | "cancelled";

export type SessionRequestSummary = {
  request_id: string;
  thread_id: string | null;
  status: SessionStatus;
  scheduled_time: string | null;
  completed_at: string | null;
  created_at: string;
  isRequester: boolean;
  /** True when the current user has already left a review for this session. */
  hasReviewedPartner: boolean;
  partner: { id: string; fullname: string; avatar_url: string | null };
  topic: { skill_name: string; category: string } | null;
};

type SkillSet = { offered: Skill[]; wanted: Skill[] };

function matchTopic(a: SkillSet, b: SkillSet): Skill | null {
  const bWantedIds = new Set(b.wanted.map((s) => s.skill_id));
  const aTeaches = a.offered.find((s) => bWantedIds.has(s.skill_id));
  if (aTeaches) return aTeaches;

  const aWantedIds = new Set(a.wanted.map((s) => s.skill_id));
  return b.offered.find((s) => aWantedIds.has(s.skill_id)) ?? null;
}

export async function getUserSessions(supabase: SupabaseClient, userId: string): Promise<SessionRequestSummary[]> {
  const withHidden = await supabase
    .from("session_requests")
    .select(
      "request_id, thread_id, requester_id, receiver_id, scheduled_time, completed_at, status, created_at, requester_hidden, receiver_hidden"
    )
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("scheduled_time", { ascending: true, nullsFirst: false });

  let sessionRows = withHidden.data ?? [];

  // Fallback before migration: no hide columns.
  if (withHidden.error?.message?.toLowerCase().includes("requester_hidden")) {
    const legacy = await supabase
      .from("session_requests")
      .select("request_id, thread_id, requester_id, receiver_id, scheduled_time, completed_at, status, created_at")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("scheduled_time", { ascending: true, nullsFirst: false });
    sessionRows = (legacy.data ?? []).map((r) => ({
      ...r,
      requester_hidden: false,
      receiver_hidden: false,
    }));
  } else {
    sessionRows = sessionRows.filter((r) => {
      const isRequester = r.requester_id === userId;
      const hidden = isRequester
        ? Boolean((r as { requester_hidden?: boolean }).requester_hidden)
        : Boolean((r as { receiver_hidden?: boolean }).receiver_hidden);
      return !hidden;
    });
  }

  if (sessionRows.length === 0) return [];

  const partnerIds = [...new Set(sessionRows.map((r) => (r.requester_id === userId ? r.receiver_id : r.requester_id)))];
  const allUserIds = [...new Set([userId, ...partnerIds])];

  const { data: users } = await supabase.from("users").select("id, fullname, avatar_url").in("id", allUserIds);
  const userById = new Map(
    (users ?? []).map((u) => [
      u.id,
      {
        fullname: u.fullname as string,
        avatar_url: ((u as { avatar_url?: string | null }).avatar_url ?? null) as string | null,
      },
    ])
  );

  const skillsByUser = new Map<string, SkillSet>();
  await Promise.all(
    allUserIds.map(async (id) => {
      const [offered, wanted] = await Promise.all([
        getUserSkills(supabase, "user_skill_offered", id),
        getUserSkills(supabase, "user_skill_wanted", id),
      ]);
      skillsByUser.set(id, { offered, wanted });
    })
  );

  const reviewedSessionIds = await getReviewedSessionIds(supabase, userId);

  return sessionRows.map((r) => {
    const isRequester = r.requester_id === userId;
    const partnerId = isRequester ? r.receiver_id : r.requester_id;
    const mySkills = skillsByUser.get(userId) ?? { offered: [], wanted: [] };
    const partnerSkills = skillsByUser.get(partnerId) ?? { offered: [], wanted: [] };
    const topicSkill = matchTopic(mySkills, partnerSkills);
    const partnerUser = userById.get(partnerId);

    return {
      request_id: r.request_id,
      thread_id: r.thread_id,
      status: r.status as SessionStatus,
      scheduled_time: r.scheduled_time,
      completed_at: r.completed_at,
      created_at: r.created_at,
      isRequester,
      hasReviewedPartner: reviewedSessionIds.has(r.request_id),
      partner: {
        id: partnerId,
        fullname: partnerUser?.fullname ?? "Unknown",
        avatar_url: partnerUser?.avatar_url ?? null,
      },
      topic: topicSkill ? { skill_name: topicSkill.skill_name, category: topicSkill.category } : null,
    };
  });
}

export async function createSessionRequest(
  supabase: SupabaseClient,
  params: { requesterId: string; receiverId: string; threadId?: string | null; scheduledTime?: string | null }
) {
  return supabase
    .from("session_requests")
    .insert({
      requester_id: params.requesterId,
      receiver_id: params.receiverId,
      thread_id: params.threadId ?? null,
      scheduled_time: params.scheduledTime ?? null,
      status: "pending",
    })
    .select("request_id")
    .single();
}

export async function respondToSessionRequest(
  supabase: SupabaseClient,
  requestId: string,
  status: "accepted" | "declined",
  scheduledTime?: string
) {
  const update: Record<string, unknown> = { status };
  if (status === "accepted" && scheduledTime) update.scheduled_time = scheduledTime;
  return supabase.from("session_requests").update(update).eq("request_id", requestId);
}

export async function completeSessionRequest(supabase: SupabaseClient, requestId: string) {
  return supabase
    .from("session_requests")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("request_id", requestId);
}

export async function cancelSessionRequest(supabase: SupabaseClient, requestId: string) {
  return supabase.from("session_requests").update({ status: "cancelled" }).eq("request_id", requestId);
}

export async function rescheduleSessionRequest(supabase: SupabaseClient, requestId: string, scheduledTime: string) {
  return supabase
    .from("session_requests")
    .update({ status: "rescheduled", scheduled_time: scheduledTime })
    .eq("request_id", requestId);
}

/** Hide a finished session from the current user's list only. */
export async function hideSessionFromHistory(
  supabase: SupabaseClient,
  params: { requestId: string; userId: string; isRequester: boolean }
) {
  const column = params.isRequester ? "requester_hidden" : "receiver_hidden";
  return supabase
    .from("session_requests")
    .update({ [column]: true })
    .eq("request_id", params.requestId);
}