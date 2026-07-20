import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import { countComments, getQuestionDetail, getAnswers } from "@/lib/forum";
import { getCommunityBySlug } from "@/lib/forumCommunities";
import { forumSubforumPath } from "@/lib/forumSubforums";
import ForumAuthorAvatar from "@/components/forum/ForumAuthorAvatar";
import PostActionBar from "@/components/forum/PostActionBar";
import CommentsSection from "@/components/forum/CommentsSection";

export const metadata: Metadata = {
  title: "Question | SkillBridge",
};

export default async function QuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
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

  const question = await getQuestionDetail(supabase, questionId);
  if (!question) notFound();

  const [answers, community] = await Promise.all([
    getAnswers(supabase, questionId, user.id, question.author.id),
    getCommunityBySlug(supabase, question.subforum_slug),
  ]);
  const communityTitle = community?.title ?? question.subforum_slug;
  const communitySlug = community?.slug ?? question.subforum_slug;
  const commentCount = countComments(answers);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-2">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm" style={{ color: "var(--sb-muted)" }}>
        <Link href="/dashboard/forum" className="font-semibold hover:underline" style={{ color: "var(--sb-teal-dark)" }}>
          Communities
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={forumSubforumPath(communitySlug)}
          className="font-semibold hover:underline"
          style={{ color: "var(--sb-teal-dark)" }}
        >
          {communityTitle}
        </Link>
      </nav>

      <div className="nb-card p-6">
        <div className="flex items-center gap-3">
          <ForumAuthorAvatar
            name={question.author.fullname}
            avatarUrl={question.author.avatar_url}
            className="h-9 w-9"
          />
          <p className="text-sm font-bold" style={{ color: "var(--sb-ink)" }}>
            {question.author.fullname}
          </p>
        </div>
        <h1 className="mt-3 text-xl font-extrabold nb-heading">{question.title}</h1>
        {question.content ? (
          <p className="mt-2 text-sm" style={{ color: "var(--sb-ink)" }}>
            {question.content}
          </p>
        ) : null}
        {question.image_url ? (
          <div className="mt-4 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={question.image_url} alt="" className="max-h-[32rem] w-full object-contain" />
          </div>
        ) : null}
        <PostActionBar
          questionId={questionId}
          commentCount={commentCount}
          authorId={question.author.id}
          currentUserId={user.id}
        />
      </div>

      <CommentsSection
        questionId={questionId}
        userInitials={userInitials}
        currentUserId={user.id}
        initialRoots={answers}
      />
    </div>
  );
}
