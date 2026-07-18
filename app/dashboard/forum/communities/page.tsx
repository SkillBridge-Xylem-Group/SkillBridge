import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { listCommunities } from "@/lib/forumCommunities";
import ManageCommunities from "@/components/forum/ManageCommunities";

export const metadata: Metadata = {
  title: "Manage communities | SkillBridge",
};

export default async function ManageCommunitiesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: viewerRow } = await supabase
    .from("users")
    .select("fullname, level, experience_points")
    .eq("id", user.id)
    .maybeSingle();

  const communities = await listCommunities(supabase, { userId: user.id });
  const joined = communities.filter((c) => c.joined);

  return (
    <DashboardLayout
      userName={viewerRow?.fullname ?? "there"}
      level={viewerRow?.level ?? 0}
      xp={viewerRow?.experience_points ?? 0}
    >
      <div className="pt-6">
        <ManageCommunities communities={joined} viewerId={user.id} />
      </div>
    </DashboardLayout>
  );
}
