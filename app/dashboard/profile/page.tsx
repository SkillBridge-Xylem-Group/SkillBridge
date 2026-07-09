import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfileClient from "@/components/profile/ProfileClient";
import LevelCard from "@/components/profile/LevelCard";
import TrustScoreCard from "@/components/profile/TrustScoreCard";
import ReviewsCard from "@/components/profile/ReviewsCard";
import type { Profile, Skill, Review } from "@/lib/types/profile";

export const metadata: Metadata = {
  title: "My Profile | SkillBridge",
};

/**
 * TODO (backend): replace this mock data with real queries once the SKILL /
 * USER_SKILL_OFFERED / USER_SKILL_WANTED tables exist, against:
 *   - USER                (fullname, bio, timezone, experience_points, level, trust_score, created_at)
 *   - USER_SKILL_OFFERED join SKILL  (where user_id = current user)
 *   - USER_SKILL_WANTED join SKILL   (where user_id = current user)
 *   - SKILL                          (full catalog, for the add-skill picker)
 *   - REVIEW join USER as reviewer  (where reviewed_user_id = current user)
 * This mock represents a brand-new user who just finished signup — Level 0,
 * 0 XP, no skills added yet, no ratings, no reviews.
 */

const MOCK_PROFILE: Profile = {
  user_id: 1,
  fullname: "Halima Mohamed",
  bio: null,
  timezone: "Asia/Jakarta",
  experience_points: 0,
  level: 0,
  trust_score: null,
  created_at: new Date().toISOString(),
};

const MOCK_SKILL_CATALOG: Skill[] = [
  { skill_id: 1, skill_name: "Python", category: "Software Development" },
  { skill_id: 2, skill_name: "Java", category: "Software Development" },
  { skill_id: 3, skill_name: "React", category: "Software Development" },
  { skill_id: 4, skill_name: "HTML", category: "Software Development" },
  { skill_id: 5, skill_name: "Cybersecurity", category: "Security" },
  { skill_id: 6, skill_name: "AWS", category: "DevOps" },
  { skill_id: 7, skill_name: "Docker", category: "DevOps" },
  { skill_id: 8, skill_name: "Networking", category: "Security" },
  { skill_id: 9, skill_name: "Linux", category: "DevOps" },
  { skill_id: 10, skill_name: "Ethical Hacking", category: "Security" },
];

const MOCK_OFFERED: Skill[] = [];
const MOCK_WANTED: Skill[] = [];
const MOCK_REVIEWS: Review[] = [];

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = MOCK_PROFILE;
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

  return (
    <DashboardLayout userName={profile.fullname}>
      <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProfileClient
            profile={profile}
            memberSince={memberSince}
            timezoneDisplay={timezoneDisplay}
            initialOffered={MOCK_OFFERED}
            initialWanted={MOCK_WANTED}
            skillCatalog={MOCK_SKILL_CATALOG}
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