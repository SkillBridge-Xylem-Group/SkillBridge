import { MessageSquare, Users, Repeat, Star, type LucideIcon } from "lucide-react";

export type DashboardStatsInput = {
  skillsSharedCount: number;
  communitiesCount: number;
  connectionsCount: number;
  connectionsThisWeek: number;
  discussionsCount: number;
  discussionsThisWeek: number;
  skillSwapsCount: number;
  skillSwapsThisWeek: number;
  trustScore: number | null;
  reviewCount: number;
};

export type DashboardStatItem = {
  id: string;
  icon: LucideIcon;
  value: string;
  label: string;
  delta: string | null;
  iconBg: string;
  iconColor: string;
};

export type BannerStats = {
  skillsSharedCount: number;
  communitiesCount: number;
};

export type DashboardStats = {
  /** Secondary stats row — DashboardStatsGrid renders these as-is. */
  grid: DashboardStatItem[];
  /** Everything ProfileStatsBanner needs besides identity fields (name/avatar/level/xp). */
  banner: BannerStats;
};

function weeklyDelta(count: number): string | null {
  return count > 0 ? `+${count} this week` : null;
}

/**
 * Single place that decides what each dashboard number is called, how it's
 * formatted, and which icon/color it gets. Connections lives only in the
 * grid (with its "+N this week" delta) — it used to also render in the
 * banner with no delta, which just repeated the same number with less
 * context. Add or reorder stats here and both the banner and grid stay
 * consistent automatically.
 */
export function buildDashboardStats(input: DashboardStatsInput): DashboardStats {
  const grid: DashboardStatItem[] = [
    {
      id: "discussions",
      icon: MessageSquare,
      value: input.discussionsCount.toLocaleString(),
      label: "Discussions",
      delta: weeklyDelta(input.discussionsThisWeek),
      iconBg: "var(--sb-emerald-light)",
      iconColor: "var(--sb-emerald-dark)",
    },
    {
      id: "connections",
      icon: Users,
      value: input.connectionsCount.toLocaleString(),
      label: "Connections",
      delta: weeklyDelta(input.connectionsThisWeek),
      iconBg: "var(--sb-tint-violet-bg)",
      iconColor: "var(--sb-tint-violet-ink)",
    },
    {
      id: "skillSwaps",
      icon: Repeat,
      value: input.skillSwapsCount.toLocaleString(),
      label: "Skill Swaps",
      delta: weeklyDelta(input.skillSwapsThisWeek),
      iconBg: "var(--sb-tint-amber-bg)",
      iconColor: "var(--sb-tint-amber-ink)",
    },
    {
      id: "reputation",
      icon: Star,
      value: input.trustScore != null ? input.trustScore.toFixed(1) : "—",
      label: "Reputation",
      delta: input.reviewCount > 0 ? `${input.reviewCount} review${input.reviewCount === 1 ? "" : "s"}` : null,
      iconBg: "var(--sb-tint-blue-bg)",
      iconColor: "var(--sb-tint-blue-ink)",
    },
  ];

  return {
    grid,
    banner: {
      skillsSharedCount: input.skillsSharedCount,
      communitiesCount: input.communitiesCount,
    },
  };
}
