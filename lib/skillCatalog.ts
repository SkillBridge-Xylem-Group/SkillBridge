import type { SupabaseClient } from "@supabase/supabase-js";
import type { Skill } from "@/lib/types/profile";
import { DEFAULT_SKILLS } from "@/lib/defaultSkills";

/** Insert any missing default skills so the profile picker stays well stocked. */
async function ensureDefaultSkills(supabase: SupabaseClient, existing: Skill[]) {
  const have = new Set(existing.map((s) => s.skill_name.trim().toLowerCase()));
  const missing = DEFAULT_SKILLS.filter((s) => !have.has(s.skill_name.trim().toLowerCase()));
  if (missing.length === 0) return;

  // Insert in chunks to avoid oversized payloads / request timeouts.
  const chunkSize = 40;
  for (let i = 0; i < missing.length; i += chunkSize) {
    const chunk = missing.slice(i, i + chunkSize);
    const { error } = await supabase.from("skills").insert(chunk);
    if (error) {
      // Non-fatal: catalog still returns whatever exists (e.g. RLS / unique races).
      console.error("ensureDefaultSkills:", error.message);
      break;
    }
  }
}

/** Full catalog from the `skills` table, for the profile page's add-skill picker. */
export async function getFullSkillCatalog(supabase: SupabaseClient): Promise<Skill[]> {
  const { data } = await supabase.from("skills").select("skill_id, skill_name, category").order("category");
  const existing = data ?? [];
  await ensureDefaultSkills(supabase, existing);

  const { data: refreshed } = await supabase
    .from("skills")
    .select("skill_id, skill_name, category")
    .order("category")
    .order("skill_name");
  return refreshed ?? existing;
}

/** Category -> skill names, for the onboarding modal's per-subject tag lists. */
export async function getSkillsByCategory(supabase: SupabaseClient): Promise<Record<string, string[]>> {
  const catalog = await getFullSkillCatalog(supabase);
  const byCategory: Record<string, string[]> = {};
  for (const skill of catalog) {
    (byCategory[skill.category] ??= []).push(skill.skill_name);
  }
  return byCategory;
}

/** A given user's offered/wanted skills, resolved from the join table to full Skill rows. */
export async function getUserSkills(
  supabase: SupabaseClient,
  table: "user_skill_offered" | "user_skill_wanted",
  userId: string
): Promise<Skill[]> {
  const { data: rows } = await supabase.from(table).select("skill_id").eq("user_id", userId);
  const skillIds = (rows ?? []).map((r) => r.skill_id);
  if (skillIds.length === 0) return [];

  const { data: skills } = await supabase
    .from("skills")
    .select("skill_id, skill_name, category")
    .in("skill_id", skillIds);

  return skills ?? [];
}
