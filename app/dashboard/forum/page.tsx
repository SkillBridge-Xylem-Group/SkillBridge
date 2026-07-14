import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
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
  const activeTab = (tab === "popular" || tab === "unanswered" ? tab : "latest") as "latest" | "popular" | "unanswered";

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
          {/* Hero banner */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white via-white to-emerald-50 p-6 shadow-sm sm:p-8">
            <img
              src="/images/forum-banner.png"
              alt=""
              className="pointer-events-none absolute right-0 top-0 h-full w-1/2 object-cover object-left opacity-90"
            />
            <div className="relative max-w-md">
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Community Forum</h1>
              <p className="mt-2 text-sm text-slate-600">
                Ask questions, share knowledge, and learn from amazing people in the SkillBridge community.
              </p>

              <form action="/dashboard/forum" method="GET" className="mt-5 flex gap-2">
                {activeTab !== "latest" && <input type="hidden" name="tab" value={activeTab} />}
                <div className="relative flex-1">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    defaultValue={q ?? ""}
                    placeholder="Search questions or keywords..."
                    className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-brand focus:outline-none"
                  />
                </div>
                <button type="submit" className="btn-pill bg-brand px-5 py-2.5 text-sm text-white hover:bg-brand-dark">
                  Search
                </button>
              </form>
            </div>
          </div>

          <QuestionComposer userInitials={userInitials} />

          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <ForumTabs active={activeTab} search={q} />
            <div className="px-6">
              {questions.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  {q ? `No questions found for "${q}".` : "No questions yet — be the first to post!"}
                </p>
              ) : (
                questions.map((question) => <QuestionFeedCard key={question.question_id} question={question} />)
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <TrendingTopics questions={allQuestionsForTrending} />

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-extrabold text-slate-900">Community Guidelines</h2>
            <p className="mt-2 text-sm text-slate-600">Be respectful, helpful, and kind. No spam or self-promotion.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}