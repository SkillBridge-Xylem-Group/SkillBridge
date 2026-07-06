import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsCards from "@/components/dashboard/StatsCards";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import PendingRequests from "@/components/dashboard/PendingRequests";
import RecentMessages from "@/components/dashboard/RecentMessages";

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
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (user.email ? deriveNameFromEmail(user.email) : "there");

  return (
    <DashboardLayout>
      <div className="space-y-6 pt-2">
        <WelcomeBanner
          name={displayName}
          message="You've completed 85% of your 'Advanced React Patterns' course. Your next session starts in 2 hours."
        />

        <StatsCards />

        <UpcomingSessions />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PendingRequests />
          <RecentMessages />
        </div>
      </div>
    </DashboardLayout>
  );
}