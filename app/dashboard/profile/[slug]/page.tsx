import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GraduationCap, Target } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PublicProfileHeader from "@/components/profile/PublicProfileHeader";
import SkillChipList from "@/components/profile/SkillChipList";
import LevelCard from "@/components/profile/LevelCard";
import TrustScoreCard from "@/components/profile/TrustScoreCard";
import ReviewsCard from "@/components/profile/ReviewsCard";
import { getUserSkills } from "@/lib/skillCatalog";
import { getUserReviews } from "@/lib/reviews";
import { deriveNameFromEmail } from "@/lib/deriveName";

export const metadata: Metadata = {
  title: "Member Profile | SkillBridge",
};

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  if (!viewer) {
    redirect("/login");
  }

  const { data: viewerRow } = await supabase
    .from("users")
    .select("fullname, level, experience_points, slug")
    .eq("id", viewer.id)
    .maybeSingle();

  // Viewing your own public profile isn't useful (no swap/message button makes
  // sense against yourself) — send them to the editable version instead.
  if (viewerRow?.slug === slug) {
    redirect("/dashboard/profile");
  }

  const viewerName =
    viewerRow?.fullname ||
    viewer.user_metadata?.full_name ||
    viewer.user_metadata?.name ||
    (viewer.email ? deriveNameFromEmail(viewer.email) : "there");

  const { data: profileRow } = await supabase
    .from("users")
    .select("id, fullname, bio, timezone, experience_points, level, trust_score, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!profileRow) {
    return (
      <DashboardLayout
        userName={viewerName}
        level={viewerRow?.level ?? 0}
        xp={viewerRow?.experience_points ?? 0}
      >
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-extrabold text-slate-900">Member not found</h1>
          <p className="mt-2 text-sm text-slate-500">This profile doesn&apos;t exist or may have been removed.</p>
        </div>
      </DashboardLayout>
    );
  }

  const memberSince = new Date(profileRow.created_at ?? Date.now()).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const timezone = profileRow.timezone ?? "UTC";
  const timezoneDisplay = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  })
    .formatToParts(new Date())
    .find((part) => part.type === "timeZoneName")?.value ?? timezone;

  const [offered, wanted, { reviews, trustScore, reviewCount }] = await Promise.all([
    getUserSkills(supabase, "user_skill_offered", profileRow.id),
    getUserSkills(supabase, "user_skill_wanted", profileRow.id),
    getUserReviews(supabase, profileRow.id),
  ]);

  return (
    <DashboardLayout userName={viewerName} level={viewerRow?.level ?? 0} xp={viewerRow?.experience_points ?? 0}>
      <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PublicProfileHeader
       fullname={profileRow.fullname}
       memberSince={memberSince}
       timezone={timezoneDisplay}
       bio={profileRow.bio}
       profileId={profileRow.id}
/>

          <SkillChipList
            icon={GraduationCap}
            iconBg="bg-brand-light"
            iconColor="text-brand"
            title="Skills Offered"
            skills={offered}
          />

          <SkillChipList
            icon={Target}
            iconBg="bg-indigo-100"
            iconColor="text-indigo-600"
            title="Skills Wanted"
            skills={wanted}
          />

          <ReviewsCard reviews={reviews} />
        </div>

        <div className="space-y-6">
          <LevelCard level={profileRow.level ?? 0} experiencePoints={profileRow.experience_points ?? 0} />
          <TrustScoreCard trustScore={trustScore} reviewCount={reviewCount} />
        </div>
      </div>
    </DashboardLayout>
  );
}
