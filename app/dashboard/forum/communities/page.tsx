import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import { listCommunities } from "@/lib/forumCommunities";
import ManageCommunities from "@/components/forum/ManageCommunities";

export const metadata: Metadata = {
  title: "Manage communities | SkillBridge",
};

export default async function ManageCommunitiesPage() {
  const { supabase, user } = await getRequestUser();
  if (!user) redirect("/login");

  const communities = await listCommunities(supabase, { userId: user.id });
  const joined = communities.filter((c) => c.joined);

  return (
    <div className="pt-2">
      <ManageCommunities communities={joined} viewerId={user.id} />
    </div>
  );
}
