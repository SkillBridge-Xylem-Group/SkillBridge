import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const selectClause = `
    id,
    slug,
    fullname,
    trust_score,
    user_skill_offered ( skills ( skill_name, category ) ),
    reviews_received:reviews!reviews_reviewed_user_id_fkey ( count )
  `;

  const { data: candidates, error: candidatesError } = await supabase
    .from("users")
    .select(selectClause)
    .neq("id", user.id)
    .neq("role", "admin")
    .order("trust_score", { ascending: false });

  if (candidatesError) {
    console.error("Browse query failed:", candidatesError);
    return NextResponse.json({ error: "Failed to load people" }, { status: 500 });
  }

  const people = (candidates ?? []).map((c) => {
    const offered = Array.isArray(c.user_skill_offered) ? c.user_skill_offered : [];
    const reviewsAgg = Array.isArray(c.reviews_received) ? c.reviews_received[0] : c.reviews_received;

    const skillEntries = offered
      .map((o) => (Array.isArray(o.skills) ? o.skills[0] : o.skills))
      .filter((s): s is { skill_name: string; category: string } => Boolean(s));

    return {
      id: c.id,
      slug: c.slug,
      name: c.fullname,
      rating: c.trust_score ?? 0,
      reviewCount: reviewsAgg?.count ?? 0,
      tags: [...new Set(skillEntries.map((s) => s.skill_name))],
      categories: [...new Set(skillEntries.map((s) => s.category))],
    };
  });

  return NextResponse.json({ people });
}