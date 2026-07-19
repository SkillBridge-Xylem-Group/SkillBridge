import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import { getForumQuestions } from "@/lib/forum";
import { listCommunities } from "@/lib/forumCommunities";
import QuestionComposer from "@/components/forum/QuestionComposer";
import CommunitiesDiscovery from "@/components/forum/CommunitiesDiscovery";
import TrendingTopics from "@/components/forum/TrendingTopics";

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

  const { data: viewerRow } = await supabase
    .from("users")
    .select("fullname")
    .eq("id", user.id)
    .maybeSingle();

  const userInitials = (viewerRow?.fullname ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p.charAt(0).toUpperCase())
    .join("");

  const [communities, trendingSource] = await Promise.all([
    listCommunities(supabase, { userId: user.id }),
    getForumQuestions(supabase, { limit: 50 }),
  ]);

  const communityOptions = communities.map((c) => ({ slug: c.slug, title: c.title }));

  return (
    <div className="grid grid-cols-1 gap-6 pt-2 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <h1 className="text-2xl font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>Discover Communities</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--sb-muted)" }}>
            Find communities to join, or create your own and start posting.
          </p>
        </div>

        <QuestionComposer
          userInitials={userInitials}
          requireSubforumSelect
          communityOptions={communityOptions}
        />

        <CommunitiesDiscovery communities={communities} initialCreateOpen={create === "1"} />
      </div>

      <div className="space-y-6">
        <TrendingTopics questions={trendingSource} />
      </div>
    </div>
  );
}