import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfileClient from "@/components/profile/ProfileClient";
import LevelCard from "@/components/profile/LevelCard";
import TrustScoreCard from "@/components/profile/TrustScoreCard";
import ReviewsCard from "@/components/profile/ReviewsCard";
import type { Profile, Review } from "@/lib/types/profile";
import { getFullSkillCatalog, tagsToSkills } from "@/lib/skillCatalog";

export const metadata: Metadata = {
  title: "My Profile | SkillBridge",
};

// Google/email signups don't always populate a display name, so fall back to
// turning the email's local part (e.g. "diah.pane") into "Diah Pane".
function deriveNameFromEmail(email: string) {
  return email
    .split("@")[0]
    .replace(/[._]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * TODO (backend): REVIEW join USER as reviewer (where reviewed_user_id =
 * current user) isn't wired up yet, so reviews stay empty here.
 */
const MOCK_REVIEWS: Review[] = [];

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: row } = await supabase
    .from("profiles")
    .select("name, bio, avatar_url, timezone, skills_offered, skills_wanted")
    .eq("id", user.id)
    .maybeSingle();

  const profile: Profile = {
    user_id: user.id,
    fullname:
      row?.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (user.email ? deriveNameFromEmail(user.email) : "there"),
    bio: row?.bio ?? null,
    avatarId: row?.avatar_url ?? null,
    timezone: row?.timezone ?? "UTC",
    // The profiles table has no xp/level/trust_score columns yet, so these
    // stay at defaults until that schema work lands.
    experience_points: 0,
    level: 0,
    trust_score: null,
    created_at: user.created_at,
  };
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const timezoneDisplay = new Intl.DateTimeFormat("en-US", {
    timeZone: profile.timezone,
    timeZoneName: "shortOffset",
  })
    .formatToParts(new Date())
    .find((part) => part.type === "timeZoneName")?.value ?? profile.timezone;

  const offered = tagsToSkills(row?.skills_offered);
  const wanted = tagsToSkills(row?.skills_wanted);
  const skillCatalog = getFullSkillCatalog();

  return (
    <DashboardLayout
      userName={profile.fullname}
      avatarId={profile.avatarId}
      level={profile.level}
      xp={profile.experience_points}
    >
      <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProfileClient
            profile={profile}
            memberSince={memberSince}
            timezoneDisplay={timezoneDisplay}
            initialOffered={offered}
            initialWanted={wanted}
            skillCatalog={skillCatalog}
          />

          <ReviewsCard reviews={MOCK_REVIEWS} />
        </div>

        <div className="space-y-6">
          <LevelCard level={profile.level} experiencePoints={profile.experience_points} />
          <TrustScoreCard trustScore={profile.trust_score} />
        </div>
      </div>
    </DashboardLayout>
  );
}