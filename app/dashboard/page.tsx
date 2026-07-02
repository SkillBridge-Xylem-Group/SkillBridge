import type { Metadata } from "next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsCards from "@/components/dashboard/StatsCards";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import PendingRequests from "@/components/dashboard/PendingRequests";
import RecentMessages from "@/components/dashboard/RecentMessages";

export const metadata: Metadata = {
  title: "Dashboard | SkillBridge",
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 pt-2">
        <WelcomeBanner
          name="Alex"
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