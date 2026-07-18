import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getForumQuestions } from "@/lib/forum";
import { getCommunityBySlug } from "@/lib/forumCommunities";
import QuestionComposer from "@/components/forum/QuestionComposer";
import QuestionFeedCard from "@/components/forum/QuestionFeedCard";
import ForumTabs from "@/components/forum/ForumTabs";
import CommunityPageHeader from "@/components/forum/CommunityPageHeader";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; tab?: string; compose?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
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

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const community = await getCommunityBySlug(supabase, slug, user.id);
  if (!community) notFound();

  const isOwner = community.created_by === user.id;

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

  const [allInSubforum, questions] = await Promise.all([
    getForumQuestions(supabase, { subforumSlug: slug }),
    getForumQuestions(supabase, {
      search: q,
      tab: activeTab,
      subforumSlug: slug,
    }),
  ]);

  const showComposer = questions.length > 0 || compose === "1";

  return (
    <DashboardLayout
      userName={viewerRow?.fullname ?? "there"}
      level={viewerRow?.level ?? 0}
      xp={viewerRow?.experience_points ?? 0}
      mainClassName="px-0 pb-24 pt-0 sm:px-0 lg:px-0 lg:pb-10"
    >
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
          <CommunityPageHeader community={community} isOwner={isOwner} />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-6 lg:px-8 lg:py-5">
        <div className="min-w-0 space-y-3 lg:col-span-1">
          {showComposer ? (
            <QuestionComposer
              userInitials={userInitials}
              subforumSlug={slug}
              communityOptions={[{ slug: community.slug, title: community.title }]}
              defaultOpen={compose === "1"}
            />
          ) : null}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <ForumTabs active={activeTab} search={q} basePath={`/dashboard/forum/c/${slug}`} />
            <div className="px-4 sm:px-6">
              {questions.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-16 text-center">
                  <p className="text-lg font-extrabold text-slate-900">
                    {q
                      ? `No posts found for "${q}"`
                      : "This community doesn't have any posts yet"}
                  </p>
                  {!q ? (
                    <>
                      <p className="mt-2 max-w-sm text-sm text-brand">
                        Make one and get this feed started.
                      </p>
                      <Link
                        href={`/dashboard/forum/c/${slug}?compose=1`}
                        className="btn-pill mt-6 inline-flex bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
                      >
                        Create Post
                      </Link>
                    </>
                  ) : null}
                </div>
              ) : (
                questions.map((question) => (
                  <QuestionFeedCard key={question.question_id} question={question} showSubforum={false} />
                ))
              )}
            </div>
          </div>
        </div>

        {allInSubforum.some((q) => q.answer_count > 0) ? (
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900">Trending in {community.title}</h2>
              <ul className="mt-3 space-y-3">
                {allInSubforum
                  .filter((q) => q.answer_count > 0)
                  .sort((a, b) => b.answer_count - a.answer_count)
                  .slice(0, 3)
                  .map((q) => (
                    <li key={q.question_id}>
                      <Link
                        href={`/dashboard/forum/${q.question_id}`}
                        className="text-sm font-semibold text-slate-800 hover:text-brand"
                      >
                        {q.title}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {q.answer_count} {q.answer_count === 1 ? "reply" : "replies"}
                      </p>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
