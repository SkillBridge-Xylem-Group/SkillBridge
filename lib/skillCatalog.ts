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
