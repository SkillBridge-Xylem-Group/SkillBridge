import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import { countComments, getQuestionDetail, getAnswers, getForumQuestions } from "@/lib/forum";
import { getCommunityBySlug } from "@/lib/forumCommunities";
import { getForumSubforum } from "@/lib/forumSubforums";
import PostActionBar from "@/components/forum/PostActionBar";
import CommentsSection from "@/components/forum/CommentsSection";
import { getViewerProfile } from "@/lib/viewerProfile";
import PostQuestionNav from "@/components/forum/PostQuestionNav";
import PostQuestionMeta from "@/components/forum/PostQuestionMeta";
import PostPageSidebar from "@/components/forum/PostPageSidebar";

export const metadata: Metadata = {
  title: "Question | SkillBridge",
};

export default async function QuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const { supabase, user } = await getRequestUser();
  if (!user) redirect("/login");

  const viewer = await getViewerProfile(supabase, user.id);

  const question = await getQuestionDetail(supabase, questionId);
  if (!question) notFound();

  const subforum = getForumSubforum(question.subforum_slug);

  const [answers, community, allInSubforum] = await Promise.all([
    getAnswers(supabase, questionId, user.id, question.author.id),
    getCommunityBySlug(supabase, question.subforum_slug, user.id),
    getForumQuestions(supabase, { subforumSlug: question.subforum_slug, limit: 12 }),
  ]);
  const communityTitle = community?.title ?? subforum.title;
  const communitySlug = community?.slug ?? question.subforum_slug;
  const communityDescription = community?.description ?? subforum.description;
  const isOwner = community?.created_by === user.id;
  const canParticipate = isOwner || Boolean(community?.joined);
  const commentCount = countComments(answers);

  return (
    <div className="min-w-0 space-y-4 pt-2">
      <PostQuestionNav communitySlug={communitySlug} communityTitle={communityTitle} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-6">
        <div className="min-w-0 space-y-4">
          <div className="nb-card overflow-hidden">
            <div className="p-5 sm:p-6">
              <PostQuestionMeta
                authorName={question.author.fullname}
                authorAvatarUrl={question.author.avatar_url}
                createdAt={question.created_at}
                communitySlug={communitySlug}
                communityTitle={communityTitle}
              />
              <h1 className="mt-4 text-xl font-extrabold nb-heading sm:text-2xl">{question.title}</h1>
              {question.content ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--sb-ink)" }}>
                  {question.content}
                </p>
              ) : null}
              {question.image_url ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={question.image_url} alt="" className="max-h-[32rem] w-full object-contain" />
                </div>
              ) : null}
            </div>
            <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
              <PostActionBar
                questionId={questionId}
                commentCount={commentCount}
                authorId={question.author.id}
                currentUserId={user.id}
              />
            </div>
          </div>

          <CommentsSection
            questionId={questionId}
            communitySlug={communitySlug}
            communityTitle={communityTitle}
            canParticipate={canParticipate}
            userName={viewer.fullname}
            userAvatarUrl={viewer.avatarUrl}
            currentUserId={user.id}
            initialRoots={answers}
          />
        </div>

        <PostPageSidebar
          community={community}
          communitySlug={communitySlug}
          communityTitle={communityTitle}
          communityDescription={communityDescription}
          questions={allInSubforum}
          currentQuestionId={questionId}
        />
      </div>
    </div>
  );
}
