import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getQuestionDetail, getAnswers } from "@/lib/forum";
import { getCommunityBySlug } from "@/lib/forumCommunities";
import { forumSubforumPath } from "@/lib/forumSubforums";
import AnswerCard from "@/components/forum/AnswerCard";
import AnswerComposer from "@/components/forum/AnswerComposer";

export const metadata: Metadata = {
  title: "Question | SkillBridge",
};

export default async function QuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
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

  const question = await getQuestionDetail(supabase, questionId);
  if (!question) notFound();

  const answers = await getAnswers(supabase, questionId, user.id);
  const community = await getCommunityBySlug(supabase, question.subforum_slug);
  const communityTitle = community?.title ?? question.subforum_slug;
  const communitySlug = community?.slug ?? question.subforum_slug;

  return (
    <DashboardLayout
      userName={viewerRow?.fullname ?? "there"}
      level={viewerRow?.level ?? 0}
      xp={viewerRow?.experience_points ?? 0}
    >
      <div className="mx-auto max-w-2xl space-y-6 pt-6">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
          <Link href="/dashboard/forum" className="font-semibold text-brand hover:underline">
            Communities
          </Link>
          <span aria-hidden>/</span>
          <Link href={forumSubforumPath(communitySlug)} className="font-semibold text-brand hover:underline">
            {communityTitle}
          </Link>
        </nav>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-900">{question.author.fullname}</p>
          <h1 className="mt-1 text-xl font-extrabold text-slate-900">{question.title}</h1>
          {question.content ? <p className="mt-2 text-sm text-slate-700">{question.content}</p> : null}
          {question.image_url ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={question.image_url} alt="" className="max-h-[32rem] w-full object-contain" />
            </div>
          ) : null}
        </div>

        <AnswerComposer questionId={questionId} userInitials={userInitials} />

        <div className="space-y-3">
          {answers.length === 0 ? (
            <p className="text-center text-sm text-slate-500">No replies yet — be the first to answer.</p>
          ) : (
            answers
              .slice()
              .sort((a, b) => (b.isTopAnswer ? 1 : 0) - (a.isTopAnswer ? 1 : 0) || b.vote_count - a.vote_count)
              .map((a) => <AnswerCard key={a.answer_id} answer={a} questionId={questionId} />)
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
