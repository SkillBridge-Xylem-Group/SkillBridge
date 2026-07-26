import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import TopRatedMembers from "@/components/dashboard/TopRatedMembers";
import RecentForumDiscussions from "@/components/dashboard/RecentForumDiscussions";
import RecentMessages from "@/components/dashboard/RecentMessages";
import OnboardingGate from "@/components/onboarding/OnboardingGate";
import { getSkillsByCategory } from "@/lib/skillCatalog";
import { isAdminUser } from "@/lib/auth/isAdmin";
export const metadata: Metadata = {
  title: "Dashboard | SkillBridge",
};

export default async function DashboardPage() {
  const { supabase, user } = await getRequestUser();
  if (!user) redirect("/login");

  const [{ data: profile }, isAdmin] = await Promise.all([
    supabase.from("users").select("bio, fullname").eq("id", user.id).maybeSingle(),
    isAdminUser(supabase, user.id),
  ]);

  if (isAdmin) {
    redirect("/dashboard/admin");
  }

  const [{ count: offeredCount }, { count: wantedCount }] = await Promise.all([
    supabase.from("user_skill_offered").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("user_skill_wanted").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const showOnboarding = !profile?.bio && (offeredCount ?? 0) === 0 && (wantedCount ?? 0) === 0;
  const skillsByCategory = showOnboarding ? await getSkillsByCategory(supabase) : {};

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TopRatedMembers />
          <RecentMessages />
        </div>

        <div className="space-y-6">
          <RecentForumDiscussions />
        </div>
      </div>

      <OnboardingGate initialShow={showOnboarding} skillsByCategory={skillsByCategory} />
    </>
  );
}