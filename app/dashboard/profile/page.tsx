import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import ProfileClient from "@/components/profile/ProfileClient";
import LevelCard from "@/components/profile/LevelCard";
import TrustScoreCard from "@/components/profile/TrustScoreCard";
import ReviewsCard from "@/components/profile/ReviewsCard";
import AchievementsCard from "@/components/profile/AchievementsCard";
import type { Profile } from "@/lib/types/profile";
import { getFullSkillCatalog, getUserSkills } from "@/lib/skillCatalog";
import { getUserReviews } from "@/lib/reviews";
import { syncUserBadges } from "@/lib/badges";
import { deriveNameFromEmail } from "@/lib/deriveName";
import { normalizeAvatarUrl } from "@/lib/avatar";

export const metadata: Metadata = {
  title: "My Profile | SkillBridge",
};

export default async function ProfilePage() {
  const { supabase, user } = await getRequestUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("users")
    .select("fullname, bio, avatar_url, slug, timezone, experience_points, level, trust_score, public_uid")
    .eq("id", user.id)
    .maybeSingle();

  const profile: Profile = {
    user_id: user.id,
    public_uid: row?.public_uid ?? null,
    fullname:
      row?.fullname ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (user.email ? deriveNameFromEmail(user.email) : "there"),
    username: row?.slug ?? "",
    bio: row?.bio ?? null,
    avatar_url: normalizeAvatarUrl(row?.avatar_url ?? null),
    timezone: row?.timezone ?? "UTC",
    experience_points: row?.experience_points ?? 0,
    level: row?.level ?? 0,
    trust_score: row?.trust_score ? row.trust_score : null,
    created_at: user.created_at,
  };
  const memberSinceDays = Math.floor(
    (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const timezoneDisplay =
    new Intl.DateTimeFormat("en-US", {
      timeZone: profile.timezone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value ?? profile.timezone;

  const [offered, wanted, skillCatalog, { reviews, trustScore, reviewCount }] = await Promise.all([
    getUserSkills(supabase, "user_skill_offered", user.id),
    getUserSkills(supabase, "user_skill_wanted", user.id),
    getFullSkillCatalog(supabase),
    getUserReviews(supabase, user.id),
  ]);

  const badges = await syncUserBadges(supabase, user.id, {
    level: profile.level,
    experiencePoints: profile.experience_points,
    trustScore,
    reviewCount,
    skillsOfferedCount: offered.length,
    skillsWantedCount: wanted.length,
    memberSinceDays,
  });

  return (
    <div className="grid grid-cols-1 gap-6 pt-2 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <ProfileClient
          profile={profile}
          timezoneDisplay={timezoneDisplay}
          initialOffered={offered}
          initialWanted={wanted}
          skillCatalog={skillCatalog}
        />

        <ReviewsCard reviews={reviews} />

        <AchievementsCard badges={badges} />
      </div>

      <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <LevelCard level={profile.level} experiencePoints={profile.experience_points} />
        <TrustScoreCard trustScore={trustScore} reviewCount={reviewCount} />
      </div>
    </div>
  );
}