import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeAvatarUrl } from "@/lib/avatar";
import { getUserSkills } from "@/lib/skillCatalog";
import type { Skill } from "@/lib/types/profile";

export type SwapSessionRoomData = {
  requestId: string;
  status: string;
  scheduledTime: string | null;
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

/** Load a session room the current user is allowed to join. */
export async function getSwapSessionForUser(
  supabase: SupabaseClient,
  requestId: string,
  userId: string
): Promise<SwapSessionRoomData | null> {
  const { data: row } = await supabase
    .from("session_requests")
    .select("request_id, requester_id, receiver_id, status, scheduled_time")
    .eq("request_id", requestId)
    .maybeSingle();

  if (!row) return null;
  if (row.requester_id !== userId && row.receiver_id !== userId) return null;

  const joinable = row.status === "accepted" || row.status === "rescheduled";
  if (!joinable) return null;

  const partnerId = row.requester_id === userId ? row.receiver_id : row.requester_id;

  const [{ data: partnerRow }, myOffered, myWanted, partnerOffered, partnerWanted] = await Promise.all([
    supabase.from("users").select("id, fullname, avatar_url").eq("id", partnerId).maybeSingle(),
    getUserSkills(supabase, "user_skill_offered", userId),
    getUserSkills(supabase, "user_skill_wanted", userId),
    getUserSkills(supabase, "user_skill_offered", partnerId),
    getUserSkills(supabase, "user_skill_wanted", partnerId),
  ]);

  const topicSkill = matchTopic(
    { offered: myOffered, wanted: myWanted },
    { offered: partnerOffered, wanted: partnerWanted }
  );

  return {
    requestId: row.request_id,
    status: row.status,
    scheduledTime: row.scheduled_time,
    partner: {
      id: partnerId,
      fullname: partnerRow?.fullname ?? "Unknown",
      avatar_url: normalizeAvatarUrl(partnerRow?.avatar_url ?? null),
    },
    topic: topicSkill
      ? { skill_name: topicSkill.skill_name, category: topicSkill.category }
      : null,
  };
}
