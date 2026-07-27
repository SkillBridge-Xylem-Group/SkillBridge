import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { getAdminUserIds } from "@/lib/auth/isAdmin";
import { normalizeAvatarUrl } from "@/lib/avatar";

export async function GET() {
  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const adminIds = await getAdminUserIds(supabase);
  const excludedIds = [...new Set([user.id, ...adminIds])];

  const selectClause = `
    id,
    slug,
    fullname,
    avatar_url,
    trust_score,
    user_skill_offered ( skills ( skill_name, category ) ),
    reviews_received:reviews!reviews_reviewed_user_id_fkey ( count )
  `;

  const { data: candidates, error: candidatesError } = await supabase
    .from("users")
    .select(selectClause)
    .not("id", "in", `(${excludedIds.join(",")})`)
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
      avatarUrl: normalizeAvatarUrl(c.avatar_url ?? null),
      rating: c.trust_score ?? 0,
      reviewCount: reviewsAgg?.count ?? 0,
      tags: [...new Set(skillEntries.map((s) => s.skill_name))],
      categories: [...new Set(skillEntries.map((s) => s.category))],
    };
  });

  return NextResponse.json({ people });
}