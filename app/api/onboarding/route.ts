import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/onboarding/validation";

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

// Resolves skill names -> skill_id, inserting into `skills` when a name
// doesn't exist yet. `category` is only used for newly-created rows.
async function resolveSkillIds(
  supabase: SupabaseClient,
  names: string[],
  category: string
): Promise<number[]> {
  const ids: number[] = [];
  for (const name of names) {
    const { data: existing, error: lookupError } = await supabase
      .from("skills")
      .select("skill_id")
      .ilike("skill_name", name)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existing) {
      ids.push(existing.skill_id);
      continue;
    }

    const { data: created, error: insertError } = await supabase
      .from("skills")
      .insert({ skill_name: name, category })
      .select("skill_id")
      .single();

    if (insertError) throw insertError;
    ids.push(created.skill_id);
  }
  return ids;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const { bio, timezone, teachSubject, teachTags, learnSubject, learnTags } = parsed.data;

  // teachSubject/learnSubject double as the category (e.g. "Design & UI/UX");
  // the tags are the individual skill_name rows under that category.
  const skillsOffered = Array.from(new Set([teachSubject, ...teachTags]));
  const skillsWanted = Array.from(new Set([learnSubject, ...learnTags]));

  // 1. `bio` / `timezone` live directly on `users` — there is no `profiles`
  //    table and no `updated_at` column on `users`, so we don't send one.
  const { error: userError } = await supabase
    .from("users")
    .update({ bio, timezone })
    .eq("id", user.id);

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  try {
    // 2. Skills are normalized: resolve names to skill_id rows in `skills`.
    const offeredIds = await resolveSkillIds(supabase, skillsOffered, teachSubject);
    const wantedIds = await resolveSkillIds(supabase, skillsWanted, learnSubject);

    // 3. Replace this user's rows in the join tables.
    const { error: clearOfferedError } = await supabase
      .from("user_skill_offered")
      .delete()
      .eq("user_id", user.id);
    if (clearOfferedError) throw clearOfferedError;

    const { error: clearWantedError } = await supabase
      .from("user_skill_wanted")
      .delete()
      .eq("user_id", user.id);
    if (clearWantedError) throw clearWantedError;

    if (offeredIds.length > 0) {
      const { error } = await supabase
        .from("user_skill_offered")
        .insert(offeredIds.map((skill_id) => ({ user_id: user.id, skill_id })));
      if (error) throw error;
    }

    if (wantedIds.length > 0) {
      const { error } = await supabase
        .from("user_skill_wanted")
        .insert(wantedIds.map((skill_id) => ({ user_id: user.id, skill_id })));
      if (error) throw error;
    }
  } catch (err) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Failed to save skills";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ message: "Onboarding saved" });
}