"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const BADGE_METRICS = [
  "skills_offered_count",
  "offered_and_wanted",
  "sessions_completed",
  "review_count",
  "level",
  "trusted_teacher",
  "member_days",
] as const;

const BADGE_TIERS = ["common", "rare", "epic", "legendary"] as const;

type BadgeInput = {
  name: string;
  description: string;
  tier: (typeof BADGE_TIERS)[number];
  icon: string;
  metric: (typeof BADGE_METRICS)[number];
  target: number;
  sort_order: number;
  is_active: boolean;
};

export async function createBadgeAction(input: BadgeInput) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("badges").insert(input);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateBadgeAction(id: string, input: Partial<BadgeInput>) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("badges").update(input).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteBadgeAction(id: string) {
  const supabase = await createSupabaseServerClient();
  // Soft-delete: user_badges rows still reference this id for users who
  // already unlocked it, so a hard delete would break their history.
  const { error } = await supabase.from("badges").update({ is_active: false }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}