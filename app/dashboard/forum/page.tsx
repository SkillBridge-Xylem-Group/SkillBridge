import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
    <DashboardLayout
      userName={viewerRow?.fullname ?? "there"}
      level={viewerRow?.level ?? 0}
      xp={viewerRow?.experience_points ?? 0}
    >
      <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Discover Communities</h1>
            <p className="mt-1 text-sm text-slate-500">
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
    </DashboardLayout>
  );
}
