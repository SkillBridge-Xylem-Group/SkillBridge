import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import { getForumQuestions } from "@/lib/forum";
import { getCommunityBySlug } from "@/lib/forumCommunities";
import QuestionComposer from "@/components/forum/QuestionComposer";
import QuestionFeedCard from "@/components/forum/QuestionFeedCard";
import ForumTabs from "@/components/forum/ForumTabs";
import CommunityPageHeader from "@/components/forum/CommunityPageHeader";
import CommunityTrendingCard from "@/components/forum/CommunityTrendingCard";
import CommunityEmptyState from "@/components/forum/CommunityEmptyState";
import { getViewerProfile } from "@/lib/viewerProfile";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; tab?: string; compose?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { supabase } = await getRequestUser();
  const community = await getCommunityBySlug(supabase, slug);
  if (!community) return { title: "Community | SkillBridge" };
  return { title: `${community.title} | Community Forum | SkillBridge` };
}

export default async function SubforumPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { q, tab, compose } = await searchParams;

  const activeTab = (tab === "popular" || tab === "unanswered" ? tab : "latest") as
    | "latest"
    | "popular"
    | "unanswered";

  const { supabase, user } = await getRequestUser();
  if (!user) redirect("/login");

  const community = await getCommunityBySlug(supabase, slug, user.id);
  if (!community) notFound();

  const isOwner = community.created_by === user.id;

  const viewer = await getViewerProfile(supabase, user.id);

  const [allInSubforum, questions] = await Promise.all([
    getForumQuestions(supabase, { subforumSlug: slug }),
    getForumQuestions(supabase, {
      search: q,
      tab: activeTab,
      subforumSlug: slug,
    }),
  ]);

  return (
    <div className="min-w-0 space-y-4">
      <CommunityPageHeader community={community} isOwner={isOwner} />

      <QuestionComposer
        userName={viewer.fullname}
        userAvatarUrl={viewer.avatarUrl}
        subforumSlug={slug}
        communityOptions={[{ slug: community.slug, title: community.title }]}
        defaultOpen={compose === "1"}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-6">
        <div className="min-w-0 space-y-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <ForumTabs active={activeTab} search={q} basePath={`/dashboard/forum/c/${slug}`} />
            <div className="px-4 sm:px-6">
              {questions.length === 0 ? (
                <CommunityEmptyState slug={slug} search={q} />
              ) : (
                questions.map((question) => (
                  <QuestionFeedCard key={question.question_id} question={question} showSubforum={false} />
                ))
              )}
            </div>
          </div>
        </div>

        <CommunityTrendingCard communityTitle={community.title} questions={allInSubforum} />
      </div>
    </div>
  );
}
