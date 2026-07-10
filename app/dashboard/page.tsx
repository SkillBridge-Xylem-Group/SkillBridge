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

export const metadata: Metadata = {
  title: "Dashboard | SkillBridge",
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

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, bio, skills_offered, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (user.email ? deriveNameFromEmail(user.email) : "there");

  // No dedicated "onboarding_completed" column exists yet, so infer it from
  // whether /api/onboarding has ever written to this profile.
  const showOnboarding = !profile?.bio && (profile?.skills_offered?.length ?? 0) === 0;

  return (
    <DashboardLayout
      userName={displayName}
      avatarId={profile?.avatar_url}
      level={0}
      xp={0}
    >
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

      <OnboardingGate initialShow={showOnboarding} />
    </DashboardLayout>
  );
}