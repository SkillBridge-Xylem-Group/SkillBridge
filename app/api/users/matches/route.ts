import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type NestedSkill = { skill_name?: string | null };
type OfferedSkillRow = { skills?: NestedSkill | NestedSkill[] | null };

function skillNameFromOffered(row: OfferedSkillRow): string | undefined {
  const skills = row.skills;
  if (!skills) return undefined;
  if (Array.isArray(skills)) return skills[0]?.skill_name ?? undefined;
  return skills.skill_name ?? undefined;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: wantedRows, error: wantedError } = await supabase
    .from("user_skill_wanted")
    .select("skill_id")
    .eq("user_id", user.id);

  if (wantedError) {
    console.error("Failed to load wanted skills:", wantedError);
    return NextResponse.json({ error: "Failed to load your wanted skills" }, { status: 500 });
  }

  const wantedSkillIds = (wantedRows ?? []).map((r) => r.skill_id);
  let matchedUserIds: string[] = [];

  if (wantedSkillIds.length > 0) {
    const { data: offerRows, error: offerError } = await supabase
      .from("user_skill_offered")
      .select("user_id")
      .in("skill_id", wantedSkillIds)
      .neq("user_id", user.id);

    if (offerError) {
      console.error("Failed to find skill matches:", offerError);
      return NextResponse.json({ error: "Failed to find matches" }, { status: 500 });
    }

    matchedUserIds = [...new Set((offerRows ?? []).map((r) => r.user_id))];
  }

  const selectClause = `
    id,
    fullname,
    trust_score,
    user_skill_offered ( skills ( skill_name ) ),
    reviews_received:reviews!reviews_reviewed_user_id_fkey ( count )
  `;

  const { data: candidates, error: candidatesError } =
    matchedUserIds.length > 0
      ? await supabase
          .from("users")
          .select(selectClause)
          .in("id", matchedUserIds)
          .order("trust_score", { ascending: false })
          .limit(3)
      : await supabase
          .from("users")
          .select(selectClause)
          .neq("id", user.id)
          .gt("trust_score", 0)
          .order("trust_score", { ascending: false })
          .limit(3);

  if (candidatesError) {
    console.error("Match query failed:", candidatesError);
    return NextResponse.json({ error: "Failed to load matches" }, { status: 500 });
  }

  const matches = (candidates ?? []).map((c) => {
    const offered = Array.isArray(c.user_skill_offered) ? c.user_skill_offered : [];
    const reviewsAgg = Array.isArray(c.reviews_received) ? c.reviews_received[0] : c.reviews_received;

    return {
      id: c.id,
      name: c.fullname,
      rating: c.trust_score ?? 0,
      reviewCount: reviewsAgg?.count ?? 0,
      tags: offered
        .map((o) => skillNameFromOffered(o as OfferedSkillRow))
        .filter((name): name is string => Boolean(name))
        .slice(0, 3),
    };
  });

  return NextResponse.json({ matches });
}