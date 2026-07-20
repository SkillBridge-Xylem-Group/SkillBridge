import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import { getForumQuestions } from "@/lib/forum";
import { listCommunities } from "@/lib/forumCommunities";
import CommunitiesDiscovery from "@/components/forum/CommunitiesDiscovery";
import TrendingTopics from "@/components/forum/TrendingTopics";
import ForumDiscoverHeader from "@/components/forum/ForumDiscoverHeader";

type PageProps = {
  searchParams: Promise<{ create?: string }>;
};

export const metadata: Metadata = {
  title: "Community Forum | SkillBridge",
};

export default async function ForumPage({ searchParams }: PageProps) {
  const { create } = await searchParams;
  const { supabase, user } = await getRequestUser();
  if (!user) redirect("/login");

  const [communities, trendingSource] = await Promise.all([
    listCommunities(supabase, { userId: user.id }),
    getForumQuestions(supabase, { limit: 50 }),
  ]);

  return (
    <div className="grid grid-cols-1 gap-6 pt-2 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <ForumDiscoverHeader />

        <CommunitiesDiscovery communities={communities} viewerId={user.id} initialCreateOpen={create === "1"} />
      </div>

      <div className="space-y-6">
        <TrendingTopics questions={trendingSource} />
      </div>
    </div>
  );
}
