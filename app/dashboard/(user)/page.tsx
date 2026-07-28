import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import TopRatedMembers from "@/components/dashboard/TopRatedMembers";
import RecentForumDiscussions from "@/components/dashboard/RecentForumDiscussions";
import RecentMessages from "@/components/dashboard/RecentMessages";
import TrendingCommunities from "@/components/dashboard/TrendingCommunities";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ProfileStatsBanner from "@/components/dashboard/ProfileStatsBanner";
import DashboardStatsGrid from "@/components/dashboard/DashboardStatsGrid";
import OnboardingGate from "@/components/onboarding/OnboardingGate";
import { getSkillsByCategory } from "@/lib/skillCatalog";
import { isAdminUser } from "@/lib/auth/isAdmin";
import { normalizeAvatarUrl } from "@/lib/avatar";
import { deriveNameFromEmail } from "@/lib/deriveName";
import { buildDashboardStats } from "@/lib/dashboardStats";
import { getUserReviews } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Dashboard | SkillBridge",
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default async function DashboardPage() {
  const { supabase, user } = await getRequestUser();
  if (!user) redirect("/login");

  const [{ data: profile }, isAdmin] = await Promise.all([
    supabase
      .from("users")
      .select("bio, fullname, avatar_url, level, experience_points")
      .eq("id", user.id)
      .maybeSingle(),
    isAdminUser(supabase, user.id),
  ]);

  // NOTE: intentionally no `if (isAdmin) redirect("/dashboard/admin")` here.
  // Admins reach this same page via the "Dashboard" link in the admin
  // sidebar — the root layout (app/dashboard/layout.tsx) already gives them
  // the admin chrome around it based on role, not the URL. Redirecting here
  // would just bounce them straight back to Admin Overview.

  const weekAgoIso = new Date(Date.now() - ONE_WEEK_MS).toISOString();

  const [
    { count: offeredCount },
    { count: wantedCount },
    { count: skillsSharedCount },
    { count: communitiesCount },
    { data: swapRows },
    { count: discussionsCount },
    { count: discussionsThisWeek },
    { trustScore, reviewCount },
  ] = await Promise.all([
    supabase.from("user_skill_offered").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("user_skill_wanted").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("user_skill_offered").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("forum_community_members")
      .select("community_id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("session_requests")
      .select("requester_id, receiver_id, status, completed_at, created_at")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
    supabase.from("forum_questions").select("question_id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("forum_questions")
      .select("question_id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", weekAgoIso),
    getUserReviews(supabase, user.id),
  ]);

  // Admins keep an empty profile by design — no bio/skills to fill in, so
  // never surface the "build your profile" onboarding modal to them.
  const showOnboarding =
    !isAdmin && !profile?.bio && (offeredCount ?? 0) === 0 && (wantedCount ?? 0) === 0;
  const skillsByCategory = showOnboarding ? await getSkillsByCategory(supabase) : {};

  // Derive connection + skill-swap stats from session_requests — a "connection"
  // is anyone you've had an accepted/rescheduled/completed swap with.
  const swaps = swapRows ?? [];
  const activeStatuses = new Set(["accepted", "rescheduled", "completed"]);
  const connectionPartners = new Set(
    swaps
      .filter((r) => activeStatuses.has(r.status))
      .map((r) => (r.requester_id === user.id ? r.receiver_id : r.requester_id))
  );
  const completedSwaps = swaps.filter((r) => r.status === "completed");
  const connectionsThisWeekPartners = new Set(
    swaps
      .filter((r) => activeStatuses.has(r.status) && r.created_at && r.created_at >= weekAgoIso)
      .map((r) => (r.requester_id === user.id ? r.receiver_id : r.requester_id))
  );
  const skillSwapsThisWeek = completedSwaps.filter(
    (r) => r.completed_at && r.completed_at >= weekAgoIso
  ).length;

  const fullname =
    profile?.fullname ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (user.email ? deriveNameFromEmail(user.email) : "there");

  // One shared shaping step — both the banner and the stats grid read off
  // this instead of each re-deriving labels/colors/deltas from raw counts.
  const stats = buildDashboardStats({
    skillsSharedCount: skillsSharedCount ?? 0,
    communitiesCount: communitiesCount ?? 0,
    connectionsCount: connectionPartners.size,
    connectionsThisWeek: connectionsThisWeekPartners.size,
    discussionsCount: discussionsCount ?? 0,
    discussionsThisWeek: discussionsThisWeek ?? 0,
    skillSwapsCount: completedSwaps.length,
    skillSwapsThisWeek,
    trustScore,
    reviewCount,
  });

  return (
    <>
      <div className="space-y-6">
        <ProfileStatsBanner
          fullname={fullname}
          avatarUrl={normalizeAvatarUrl(profile?.avatar_url ?? null)}
          level={profile?.level ?? 0}
          experiencePoints={profile?.experience_points ?? 0}
          trustScore={trustScore}
          {...stats.banner}
        />

        <DashboardStatsGrid stats={stats.grid} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopRatedMembers />
          </div>
          <div>
            <TrendingCommunities />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <RecentForumDiscussions />
          <ActivityFeed />
          <RecentMessages />
        </div>
      </div>

      <OnboardingGate initialShow={showOnboarding} skillsByCategory={skillsByCategory} />
    </>
  );
}