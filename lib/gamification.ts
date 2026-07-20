import type { SupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/notifications";

// FR-009: 1 XP per completed teaching session; level up every 20 points
// (mirrors the level = floor(xp / 20) model used in LevelCard).
export async function awardSessionCompletionXp(supabase: SupabaseClient, userId: string) {
  const { data: userRow } = await supabase
    .from("users")
    .select("experience_points, level")
    .eq("id", userId)
    .maybeSingle();
  if (!userRow) return;

  const previousLevel = userRow.level ?? 0;
  const newXp = (userRow.experience_points ?? 0) + 1;
  const newLevel = Math.floor(newXp / 20);

  await supabase.from("users").update({ experience_points: newXp, level: newLevel }).eq("id", userId);

  if (newLevel > previousLevel) {
    await createNotification(supabase, {
      userId,
      type: "level_up",
      message: `You reached Level ${newLevel}! You now have ${newXp} XP.`,
      relatedEntityType: "user",
      relatedEntityId: userId,
    });
  }
}
