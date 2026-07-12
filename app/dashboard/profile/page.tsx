import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfileClient from "@/components/profile/ProfileClient";
import LevelCard from "@/components/profile/LevelCard";
import TrustScoreCard from "@/components/profile/TrustScoreCard";
import ReviewsCard from "@/components/profile/ReviewsCard";
import type { Profile, Review, Skill } from "@/lib/types/profile";
import { getFullSkillCatalog } from "@/lib/skillCatalog";
import { deriveNameFromEmail } from "@/lib/deriveName";
import type { SupabaseClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "My Profile | SkillBridge",
};

/**
 * TODO (backend): REVIEW join USER as reviewer (where reviewed_user_id =
 * current user) isn't wired up yet, so reviews stay empty here.
 */
const MOCK_REVIEWS: Review[] = [];

async function getUserSkills(
  supabase: SupabaseClient,
  table: "user_skill_offered" | "user_skill_wanted",
  userId: string
): Promise<Skill[]> {
  const { data: rows } = await supabase.from(table).select("skill_id").eq("user_id", userId);
  const skillIds = (rows ?? []).map((r) => r.skill_id);
  if (skillIds.length === 0) return [];

  const { data: skills } = await supabase
    .from("skills")
    .select("skill_id, skill_name, category")
    .in("skill_id", skillIds);

  return skills ?? [];
}

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: row } = await supabase
    .from("users")
    .select("fullname, bio, timezone, experience_points, level, trust_score")
    .eq("id", user.id)
    .maybeSingle();

  const profile: Profile = {
    user_id: user.id,
    fullname:
      row?.fullname ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (user.email ? deriveNameFromEmail(user.email) : "there"),
    bio: row?.bio ?? null,
    timezone: row?.timezone ?? "UTC",
    experience_points: row?.experience_points ?? 0,
    level: row?.level ?? 0,
    // trust_score is NOT NULL in the DB (defaults to 0), but 0 means "no
    // ratings yet" the same as null does for TrustScoreCard's display.
    trust_score: row?.trust_score ? row.trust_score : null,
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

  const [offered, wanted, skillCatalog] = await Promise.all([
    getUserSkills(supabase, "user_skill_offered", user.id),
    getUserSkills(supabase, "user_skill_wanted", user.id),
    getFullSkillCatalog(supabase),
  ]);

  return (
    <DashboardLayout userName={profile.fullname} level={profile.level} xp={profile.experience_points}>
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
