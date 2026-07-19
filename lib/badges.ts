import type { SupabaseClient } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Handshake,
  Users,
  Rocket,
  Crown,
  Star,
  MessageCircle,
  Layers,
  Compass,
  CalendarClock,
  Gem,
  Award,
} from "lucide-react";

export type BadgeTier = "common" | "rare" | "epic" | "legendary";

export const TIER_LABEL: Record<BadgeTier, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

/** Tier -> visual treatment. Presentation only, so this stays in code. */
export const TIER_STYLE: Record<
  BadgeTier,
  { gradient: string; glow: string; ring: string; chipBg: string; chipInk: string }
> = {
  common: {
    gradient: "linear-gradient(135deg, #22c55e, #14b8a6)",
    glow: "rgba(34, 197, 94, 0.35)",
    ring: "#a7f3d0",
    chipBg: "var(--sb-emerald-light)",
    chipInk: "var(--sb-emerald-dark)",
  },
  rare: {
    gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    glow: "rgba(59, 130, 246, 0.35)",
    ring: "#bfdbfe",
    chipBg: "var(--sb-tint-blue-bg)",
    chipInk: "var(--sb-tint-blue-ink)",
  },
  epic: {
    gradient: "linear-gradient(135deg, #8b5cf6, #d946ef)",
    glow: "rgba(139, 92, 246, 0.4)",
    ring: "#ddd6fe",
    chipBg: "var(--sb-tint-violet-bg)",
    chipInk: "var(--sb-tint-violet-ink)",
  },
  legendary: {
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    glow: "rgba(245, 158, 11, 0.45)",
    ring: "#fde68a",
    chipBg: "var(--sb-tint-amber-bg)",
    chipInk: "var(--sb-tint-amber-ink)",
  },
};

// Maps the `icon` text column in `public.badges` to a component. Adding a
// badge with a new icon name in the DB requires adding one line here — the
// name/description/tier/target themselves need no code change at all.
//
// Exported (not resolved server-side) because Server Components can't pass
// component/function values as props to Client Components — icon stays a
// plain string on EvaluatedBadge, and AchievementsCard (a client component)
// does the ICON_MAP lookup itself at render time.
export const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  handshake: Handshake,
  users: Users,
  rocket: Rocket,
  crown: Crown,
  star: Star,
  "message-circle": MessageCircle,
  layers: Layers,
  compass: Compass,
  "calendar-clock": CalendarClock,
  gem: Gem,
};

export const DEFAULT_ICON: LucideIcon = Award;

export type BadgeStats = {
  level: number;
  experiencePoints: number;
  trustScore: number | null;
  reviewCount: number;
  skillsOfferedCount: number;
  skillsWantedCount: number;
  memberSinceDays: number;
};

type BadgeRow = {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  icon: string;
  metric: string;
  target: number;
  sort_order: number;
};

export type EvaluatedBadge = {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  /** Icon key from the badges.icon column — resolve via ICON_MAP in the client component. */
  icon: string;
  current: number;
  target: number;
  unlocked: boolean;
  unlockedAt: string | null;
  /** True if this unlock was persisted for the first time during this call. */
  justUnlocked: boolean;
  progressPct: number;
};

// FR-009: 1 XP per completed teaching session, so experiencePoints doubles
// as the session counter for the sessions_completed metric.
function computeMetricValue(metric: string, stats: BadgeStats): number {
  switch (metric) {
    case "skills_offered_count":
      return stats.skillsOfferedCount;
    case "offered_and_wanted":
      return (stats.skillsOfferedCount > 0 ? 1 : 0) + (stats.skillsWantedCount > 0 ? 1 : 0);
    case "sessions_completed":
      return stats.experiencePoints;
    case "review_count":
      return stats.reviewCount;
    case "level":
      return stats.level;
    case "trusted_teacher": {
      const ratingOk = (stats.trustScore ?? 0) >= 4.5;
      return Math.min(stats.reviewCount, 5) + (ratingOk ? 1 : 0);
    }
    case "member_days":
      return stats.memberSinceDays;
    default:
      return 0;
  }
}

/** Read-only: catalog + this user's existing unlocks, no writes. Use for other users' profiles. */
export async function getUserBadges(
  supabase: SupabaseClient,
  userId: string,
  stats: BadgeStats
): Promise<EvaluatedBadge[]> {
  const [{ data: catalog }, { data: unlocks }] = await Promise.all([
    supabase.from("badges").select("id, name, description, tier, icon, metric, target, sort_order").eq("is_active", true).order("sort_order"),
    supabase.from("user_badges").select("badge_id, unlocked_at").eq("user_id", userId),
  ]);

  const unlockedAtById = new Map((unlocks ?? []).map((u) => [u.badge_id, u.unlocked_at as string]));

  return evaluate(catalog ?? [], stats, unlockedAtById, new Set());
}

/**
 * Evaluate the catalog against live stats, persist any newly-crossed
 * thresholds as real unlock rows, and return the full list with accurate
 * `unlockedAt` timestamps and a `justUnlocked` flag for ones earned right now.
 * Call this for the signed-in user's own profile (RLS only allows inserting
 * your own unlock rows).
 */
export async function syncUserBadges(
  supabase: SupabaseClient,
  userId: string,
  stats: BadgeStats
): Promise<EvaluatedBadge[]> {
  const [{ data: catalog }, { data: unlocks }] = await Promise.all([
    supabase.from("badges").select("id, name, description, tier, icon, metric, target, sort_order").eq("is_active", true).order("sort_order"),
    supabase.from("user_badges").select("badge_id, unlocked_at").eq("user_id", userId),
  ]);

  const rows = catalog ?? [];
  const unlockedAtById = new Map((unlocks ?? []).map((u) => [u.badge_id, u.unlocked_at as string]));

  const newlyUnlockedIds = rows
    .filter((b) => !unlockedAtById.has(b.id) && computeMetricValue(b.metric, stats) >= b.target)
    .map((b) => b.id);

  if (newlyUnlockedIds.length > 0) {
    const { error } = await supabase
      .from("user_badges")
      .insert(newlyUnlockedIds.map((badge_id) => ({ user_id: userId, badge_id })));
    // If this races with another request inserting the same row, the PK
    // conflict just errors here — safe to ignore, the unlock still stuck.
    if (error) console.error("[badges] syncUserBadges insert:", error.message);

    const { data: freshUnlocks } = await supabase
      .from("user_badges")
      .select("badge_id, unlocked_at")
      .eq("user_id", userId)
      .in("badge_id", newlyUnlockedIds);
    for (const u of freshUnlocks ?? []) {
      unlockedAtById.set(u.badge_id, u.unlocked_at as string);
    }
  }

  return evaluate(rows, stats, unlockedAtById, new Set(newlyUnlockedIds));
}

function evaluate(
  rows: BadgeRow[],
  stats: BadgeStats,
  unlockedAtById: Map<string, string>,
  justUnlockedIds: Set<string>
): EvaluatedBadge[] {
  return rows
    .map((row) => {
      const current = computeMetricValue(row.metric, stats);
      const unlockedAt = unlockedAtById.get(row.id) ?? null;
      const unlocked = unlockedAt != null;
      const progressPct = row.target > 0 ? Math.min(100, Math.round((current / row.target) * 100)) : 0;
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        tier: row.tier,
        icon: row.icon,
        current: Math.min(current, row.target),
        target: row.target,
        unlocked,
        unlockedAt,
        justUnlocked: justUnlockedIds.has(row.id),
        progressPct,
      };
    })
    .sort((a, b) => {
      // Unlocked first (most recent unlock first), then locked ones sorted
      // by how close they are to unlocking — keeps the next achievable goal
      // near the top instead of buried in catalog order.
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      if (a.unlocked && b.unlocked) {
        return new Date(b.unlockedAt ?? 0).getTime() - new Date(a.unlockedAt ?? 0).getTime();
      }
      return b.progressPct - a.progressPct;
    });
}