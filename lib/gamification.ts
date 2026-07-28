import type { SupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/notifications";
import { tryCreateSupabaseAdminClient } from "@/lib/supabase/admin";

// FR-009: TryHackMe-style progression rulebook — an explicit "do X -> get Y XP"
// table instead of one flat award. Level = floor(xp / 20), mirrored in LevelCard.
//
// Amounts are weighted by how hard each action is to fake:
// - Actions another real person has to confirm (finishing a session, leaving
//   a review) are worth the most.
// - Actions only you control (posting) are worth the least, and lean on the
//   existing rate limits in lib/auth/action-rate-limit.ts to stay uncheatable.
//
// Deliberately NOT awarding XP for: joining a community (togglable with no
// cooldown -> trivially farmable) or answer upvotes (no anti-sockpuppet
// protection yet). Add those only once there's a safeguard in place.
export const XP_RULES = {
  sessionCompleted: 5,
  onboardingCompleted: 3,
  forumPostCreated: 1,
  forumAnswerCreated: 1,
} as const;

const XP_PER_LEVEL = 20;

/**
 * Core primitive every award function below goes through: add `amount` XP,
 * persist the new level, and notify the user if they crossed a level
 * threshold. `reason` is only used for error logging.
 */
async function awardXp(userId: string, amount: number, reason: string): Promise<void> {
  if (amount <= 0) return;

  const admin = tryCreateSupabaseAdminClient();
  if (!admin) {
    console.error(`[gamification] SUPABASE_SERVICE_ROLE_KEY missing; ${reason} XP not awarded`);
    return;
  }

  const { data: userRow } = await admin
    .from("users")
    .select("experience_points, level")
    .eq("id", userId)
    .maybeSingle();
  if (!userRow) return;

  const previousLevel = userRow.level ?? 0;
  const newXp = (userRow.experience_points ?? 0) + amount;
  const newLevel = Math.floor(newXp / XP_PER_LEVEL);

  const { error } = await admin
    .from("users")
    .update({ experience_points: newXp, level: newLevel })
    .eq("id", userId);

  if (error) {
    console.error(`[gamification] XP update failed (${reason}):`, error.message);
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

/** Awarded to both participants when a skill-swap session is marked completed. */
export async function awardSessionCompletionXp(_supabase: SupabaseClient, userId: string): Promise<void> {
  await awardXp(userId, XP_RULES.sessionCompleted, "session_completed");
}

/** Awarded to the reviewed user when someone leaves them a review — XP equals the star rating (1-5). */
export async function awardReviewReceivedXp(
  _supabase: SupabaseClient,
  userId: string,
  rating: number
): Promise<void> {
  const amount = Math.min(5, Math.max(0, Math.round(rating)));
  await awardXp(userId, amount, "review_received");
}

/** One-time bonus for finishing onboarding. Only call this from the user's first-ever save. */
export async function awardOnboardingCompletionXp(_supabase: SupabaseClient, userId: string): Promise<void> {
  await awardXp(userId, XP_RULES.onboardingCompleted, "onboarding_completed");
}

/** Awarded when a user starts a new forum discussion. Rides on the existing forumPost rate limit. */
export async function awardForumPostXp(_supabase: SupabaseClient, userId: string): Promise<void> {
  await awardXp(userId, XP_RULES.forumPostCreated, "forum_post_created");
}

/** Awarded when a user posts a forum answer/comment. Rides on the existing forumComment rate limit. */
export async function awardForumAnswerXp(_supabase: SupabaseClient, userId: string): Promise<void> {
  await awardXp(userId, XP_RULES.forumAnswerCreated, "forum_answer_created");
}
