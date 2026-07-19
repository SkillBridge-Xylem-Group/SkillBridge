import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateOrCreateUser } from "@/lib/profile/upsertUser";

const skillsSchema = z.object({
  offered: z.array(z.string()).optional(),
  wanted: z.array(z.string()).optional(),
});

async function replaceSkillRows(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  table: "user_skill_offered" | "user_skill_wanted",
  userId: string,
  skillNames: string[]
) {
  const { data: skillRows, error: lookupError } = await supabase
    .from("skills")
    .select("skill_id, skill_name")
    .in("skill_name", skillNames);

  if (lookupError) return lookupError;

  const skillIdByName = new Map((skillRows ?? []).map((s) => [s.skill_name, s.skill_id]));

  const { error: deleteError } = await supabase.from(table).delete().eq("user_id", userId);
  if (deleteError) return deleteError;

  const rows = skillNames
    .map((name) => skillIdByName.get(name))
    .filter((skillId): skillId is number => skillId != null)
    .map((skillId) => ({ user_id: userId, skill_id: skillId }));

  if (rows.length === 0) return null;

  const { error: insertError } = await supabase.from(table).insert(rows);
  return insertError;
}

export async function POST(request: Request) {
  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const parsed = skillsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid skills payload" }, { status: 400 });
  }

  if (!parsed.data.offered && !parsed.data.wanted) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Skill rows have a FK to users(id), so the user row must exist first.
  const { error: userError } = await updateOrCreateUser(supabase, user, {});
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  if (parsed.data.offered) {
    const error = await replaceSkillRows(supabase, "user_skill_offered", user.id, parsed.data.offered);
    if (error) return NextResponse.json({ error: "Failed to save offered skills" }, { status: 500 });
  }

  if (parsed.data.wanted) {
    const error = await replaceSkillRows(supabase, "user_skill_wanted", user.id, parsed.data.wanted);
    if (error) return NextResponse.json({ error: "Failed to save wanted skills" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
