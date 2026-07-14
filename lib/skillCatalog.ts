import type { SupabaseClient } from "@supabase/supabase-js";
import type { Skill } from "@/lib/types/profile";

/** Full catalog from the `skills` table, for the profile page's add-skill picker. */
export async function getFullSkillCatalog(supabase: SupabaseClient): Promise<Skill[]> {
  const { data } = await supabase.from("skills").select("skill_id, skill_name, category").order("category");
  return data ?? [];
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
