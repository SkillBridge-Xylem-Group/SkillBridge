import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getForumQuestions } from "@/lib/forum";
import { listCommunities } from "@/lib/forumCommunities";
import CommunityManagementTabs from "@/components/admin/CommunityManagementTabs";

export const metadata: Metadata = {
  title: "Community | Admin | SkillBridge",
};

type PageProps = {
  searchParams: Promise<{ q?: string; tab?: string }>;
};

export default async function AdminCommunityPage({ searchParams }: PageProps) {
  const { q, tab } = await searchParams;
  const term = q?.trim();
  const activeTab = tab === "questions" || tab === "answers" ? tab : "communities";

  const supabase = await createSupabaseServerClient();

  const [questions, allCommunities, answersResult] = await Promise.all([
    getForumQuestions(supabase, { search: term, limit: 100 }),
    listCommunities(supabase),
    supabase
      .from("forum_answers")
      .select("answer_id, content, question_id, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const rawAnswers = answersResult.data ?? [];

  const answerUserIds = [...new Set(rawAnswers.map((a) => a.user_id))];
  const answerQuestionIds = [...new Set(rawAnswers.map((a) => a.question_id))];

  const [{ data: answerUsers }, { data: answerQuestions }] = await Promise.all([
    answerUserIds.length
      ? supabase.from("users").select("id, fullname").in("id", answerUserIds)
      : Promise.resolve({ data: [] as { id: string; fullname: string }[] }),
    answerQuestionIds.length
      ? supabase.from("forum_questions").select("question_id, title").in("question_id", answerQuestionIds)
      : Promise.resolve({ data: [] as { question_id: string; title: string }[] }),
  ]);

  const answerUserMap = new Map((answerUsers ?? []).map((u) => [u.id, u.fullname]));
  const answerQuestionMap = new Map((answerQuestions ?? []).map((q) => [q.question_id, q.title]));

  const answers = rawAnswers
    .filter((a) =>
      term
        ? a.content.toLowerCase().includes(term.toLowerCase()) ||
          (answerQuestionMap.get(a.question_id) ?? "").toLowerCase().includes(term.toLowerCase())
        : true
    )
    .map((a) => ({
      answer_id: a.answer_id,
      content: a.content,
      created_at: a.created_at,
      authorName: answerUserMap.get(a.user_id) ?? "Unknown",
      questionTitle: answerQuestionMap.get(a.question_id) ?? "Unknown question",
      questionId: a.question_id,
    }));

  const communities = term
    ? allCommunities.filter(
        (c) =>
          c.title.toLowerCase().includes(term.toLowerCase()) ||
          c.description.toLowerCase().includes(term.toLowerCase()) ||
          c.category.toLowerCase().includes(term.toLowerCase())
      )
    : allCommunities;

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-semibold text-gray-900">Community</h1>
      <p className="mt-1 text-sm text-gray-500">Browse communities, questions, and answers across the platform.</p>

      {/* White card container, matching the Settings page reference */}
      <div
        className="mt-6 rounded-[24px] bg-white p-6 md:p-8"
        style={{ boxShadow: "var(--sb-shadow-sm)" }}
      >
        <CommunityManagementTabs
          activeTab={activeTab}
          searchTerm={term ?? ""}
          questions={questions}
          communities={communities}
          answers={answers}
        />
      </div>
    </div>
  );
}