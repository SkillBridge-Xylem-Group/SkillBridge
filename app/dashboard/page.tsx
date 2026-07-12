import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import TopRatedMembers from "@/components/dashboard/TopRatedMembers";
import RecentForumDiscussions from "@/components/dashboard/RecentForumDiscussions";
import QuickActions from "@/components/dashboard/QuickActions";
import TipCard from "@/components/dashboard/TipCard";
import OnboardingGate from "@/components/onboarding/OnboardingGate";
import { deriveNameFromEmail } from "@/lib/deriveName";
import { getSkillsByCategory } from "@/lib/skillCatalog";

export const metadata: Metadata = {
  title: "Dashboard | SkillBridge",
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("fullname, bio, experience_points, level")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.fullname ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (user.email ? deriveNameFromEmail(user.email) : "there");

  // No dedicated "onboarding_completed" column exists, so infer it from
  // whether the user has a bio or has picked any skills yet.
  const { count: offeredCount } = await supabase
    .from("user_skill_offered")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  const { count: wantedCount } = await supabase
    .from("user_skill_wanted")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const showOnboarding = !profile?.bio && (offeredCount ?? 0) === 0 && (wantedCount ?? 0) === 0;
  const skillsByCategory = await getSkillsByCategory(supabase);

  return (
    <DashboardLayout userName={displayName} level={profile?.level ?? 0} xp={profile?.experience_points ?? 0}>
      <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <WelcomeBanner name={displayName} />
          <TopRatedMembers />
          <RecentForumDiscussions />
        </div>

        <div className="space-y-6">
          <QuickActions />
          <TipCard />
        </div>
      </div>

      <OnboardingGate initialShow={showOnboarding} skillsByCategory={skillsByCategory} />
    </DashboardLayout>
  );
}
