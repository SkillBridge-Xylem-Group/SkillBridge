import type { SupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/notifications";
import { tryCreateSupabaseAdminClient } from "@/lib/supabase/admin";

// FR-009: 1 XP per completed teaching session; level up every 20 points
// (mirrors the level = floor(xp / 20) model used in LevelCard).
export async function awardSessionCompletionXp(_supabase: SupabaseClient, userId: string) {
  const admin = tryCreateSupabaseAdminClient();
  if (!admin) {
    console.error("[gamification] SUPABASE_SERVICE_ROLE_KEY missing; XP not awarded");
    return;
  }

  const { data: userRow } = await admin
    .from("users")
    .select("experience_points, level")
    .eq("id", userId)
    .maybeSingle();
  if (!userRow) return;

  const previousLevel = userRow.level ?? 0;
  const newXp = (userRow.experience_points ?? 0) + 1;
  const newLevel = Math.floor(newXp / 20);

  const { error } = await admin
    .from("users")
    .update({ experience_points: newXp, level: newLevel })
    .eq("id", userId);

  if (error) {
    console.error("[gamification] XP update failed:", error.message);
    return;
  }

  if (newLevel > previousLevel) {
    await createNotification(admin, {
      userId,
      type: "level_up",
      message: `You reached Level ${newLevel}! You now have ${newXp} XP.`,
      relatedEntityType: "user",
      relatedEntityId: userId,
    });
  }
}
