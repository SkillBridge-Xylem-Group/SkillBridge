import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getQuestionDetail, getAnswers } from "@/lib/forum";
import AnswerCard from "@/components/forum/AnswerCard";
import AnswerComposer from "@/components/forum/AnswerComposer";

export const metadata: Metadata = {
  title: "Question | SkillBridge",
};

export default async function QuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
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

  return (
    <DashboardLayout
      userName={viewerRow?.fullname ?? "there"}
      level={viewerRow?.level ?? 0}
      xp={viewerRow?.experience_points ?? 0}
    >
      <div className="mx-auto max-w-2xl space-y-6 pt-6">
        <div className="nb-card p-6">
          <p className="text-sm font-bold" style={{ color: "var(--neu-ink)" }}>{question.author.fullname}</p>
          <h1 className="mt-1 text-xl font-extrabold nb-heading">{question.title}</h1>
          {question.content ? <p className="mt-2 text-sm" style={{ color: "var(--neu-ink)" }}>{question.content}</p> : null}
          {question.image_url ? (
            <div className="mt-4 overflow-hidden rounded-xl" style={{ border: "2.5px solid var(--neu-ink)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={question.image_url} alt="" className="max-h-[32rem] w-full object-contain" />
            </div>
          ) : null}
        </div>

        <AnswerComposer questionId={questionId} userInitials={userInitials} />

        <div className="space-y-3">
          {answers.length === 0 ? (
            <p className="text-center text-sm" style={{ color: "var(--neu-text-muted)" }}>No replies yet — be the first to answer.</p>
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