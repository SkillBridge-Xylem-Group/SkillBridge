import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/onboarding/validation";
import { deriveNameFromEmail } from "@/lib/deriveName";
import { isUsernameAvailable, validateUsernameFormat } from "@/lib/username";

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

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

  const { username, bio, timezone, teachSubject, teachTags, learnSubject, learnTags } = parsed.data;

  const format = validateUsernameFormat(username);
  if (!("ok" in format)) {
    return NextResponse.json({ error: format.error }, { status: 400 });
  }

  const available = await isUsernameAvailable(supabase, format.username, user.id);
  if (!available) {
    return NextResponse.json({ error: "TAKEN" }, { status: 409 });
  }

  const { data: existing } = await supabase.from("users").select("id").eq("id", user.id).maybeSingle();

  if (existing) {
    const { error: userError } = await supabase
      .from("users")
      .update({ bio, timezone, slug: format.username })
      .eq("id", user.id);

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }
  } else {
    const fullname =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      (user.email ? deriveNameFromEmail(user.email) : "New User");

    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      email: user.email ?? "",
      fullname,
      slug: format.username,
      bio,
      timezone,
      experience_points: 0,
      level: 0,
      trust_score: 0,
      role: "user",
    });

    if (insertError) {
      if (insertError.message?.toLowerCase().includes("unique")) {
        return NextResponse.json({ error: "TAKEN" }, { status: 409 });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  const skillsOffered = Array.from(new Set([teachSubject, ...teachTags]));
  const skillsWanted = Array.from(new Set([learnSubject, ...learnTags]));

  try {
    const offeredIds = await resolveSkillIds(supabase, skillsOffered, teachSubject);
    const wantedIds = await resolveSkillIds(supabase, skillsWanted, learnSubject);

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

  return NextResponse.json({ message: "Onboarding saved", username: format.username });
}
