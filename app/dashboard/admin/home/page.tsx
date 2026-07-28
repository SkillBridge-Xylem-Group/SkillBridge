import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import TopRatedMembers from "@/components/dashboard/TopRatedMembers";
import RecentForumDiscussions from "@/components/dashboard/RecentForumDiscussions";
import RecentMessages from "@/components/dashboard/RecentMessages";

export const metadata: Metadata = {
  title: "Dashboard | SkillBridge",
};

// Same content as the regular user Dashboard page, minus the isAdmin
// redirect guard — that guard is what sent admins straight back to
// /dashboard/admin whenever they landed here, which is exactly what this
// admin-scoped route exists to avoid.
export default async function AdminHomePage() {
  const { user } = await getRequestUser();
  if (!user) redirect("/login");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <TopRatedMembers />
        <RecentMessages />
      </div>

      <div className="space-y-6">
        <RecentForumDiscussions />
      </div>
    </div>
  );
}