import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getForumQuestions } from "@/lib/forum";
import QuestionComposer from "@/components/forum/QuestionComposer";
import QuestionFeedCard from "@/components/forum/QuestionFeedCard";
import ForumTabs from "@/components/forum/ForumTabs";
import TrendingTopics from "@/components/forum/TrendingTopics";

export const metadata: Metadata = {
  title: "Community Forum | SkillBridge",
};

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const { q, tab } = await searchParams;
  const activeTab = (tab === "popular" || tab === "unanswered" ? tab : "latest") as
    | "latest"
    | "popular"
    | "unanswered";

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

  const questions = await getForumQuestions(supabase, { search: q, tab: activeTab });
  const allQuestionsForTrending = q ? await getForumQuestions(supabase, {}) : questions;

  return (
    <DashboardLayout
      userName={viewerRow?.fullname ?? "there"}
      level={viewerRow?.level ?? 0}
      xp={viewerRow?.experience_points ?? 0}
    >
      <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <QuestionComposer userInitials={userInitials} />

          <div className="nb-card overflow-hidden">
            <ForumTabs active={activeTab} search={q} />
            <div className="px-6">
              {questions.length === 0 ? (
                <p className="py-8 text-center text-sm" style={{ color: "var(--neu-text-muted)" }}>
                  {q ? `No questions found for "${q}".` : "No questions yet — be the first to post!"}
                </p>
              ) : (
                questions.map((question) => (
                  <QuestionFeedCard key={question.question_id} question={question} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <TrendingTopics questions={allQuestionsForTrending} />
        </div>
      </div>
    </DashboardLayout>
  );
}
