import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/onboarding/validation";
import { updateOrCreateUser } from "@/lib/profile/upsertUser";

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

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { bio, timezone, teachTags, learnTags } = parsed.data;

  const { error: userError } = await updateOrCreateUser(supabase, user, { bio, timezone });
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // The subject fields (teachSubject/learnSubject) are just used to scope
  // which tags are shown in the UI — only the selected tags themselves are
  // real skills, so only they get saved against user_skill_offered/wanted.
  const allTagNames = Array.from(new Set([...teachTags, ...learnTags]));
  const { data: skillRows, error: skillLookupError } = await supabase
    .from("skills")
    .select("skill_id, skill_name")
    .in("skill_name", allTagNames);

  if (skillLookupError) {
    return NextResponse.json({ error: skillLookupError.message }, { status: 500 });
  }

  const skillIdByName = new Map((skillRows ?? []).map((s) => [s.skill_name, s.skill_id]));

  await supabase.from("user_skill_offered").delete().eq("user_id", user.id);
  await supabase.from("user_skill_wanted").delete().eq("user_id", user.id);

  const offeredRows = teachTags
    .map((name) => skillIdByName.get(name))
    .filter((skillId): skillId is number => skillId != null)
    .map((skillId) => ({ user_id: user.id, skill_id: skillId }));

  const wantedRows = learnTags
    .map((name) => skillIdByName.get(name))
    .filter((skillId): skillId is number => skillId != null)
    .map((skillId) => ({ user_id: user.id, skill_id: skillId }));

  if (offeredRows.length > 0) {
    const { error } = await supabase.from("user_skill_offered").insert(offeredRows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (wantedRows.length > 0) {
    const { error } = await supabase.from("user_skill_wanted").insert(wantedRows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Onboarding saved" });
}
