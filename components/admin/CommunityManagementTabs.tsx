"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { ForumQuestionSummary } from "@/lib/forum";
import type { ForumCommunity } from "@/lib/forumCommunities";
import AdminDeleteQuestionButton from "@/components/admin/AdminDeleteQuestionButton";
import AdminDeleteCommunityButton from "@/components/admin/AdminDeleteCommunityButton";
import AdminDeleteAnswerButton from "@/components/admin/AdminDeleteAnswerButton";

type TabKey = "communities" | "questions" | "answers";

type AnswerRow = {
  answer_id: string;
  content: string;
  created_at: string;
  authorName: string;
  questionTitle: string;
  questionId: string;
};

type CommunityManagementTabsProps = {
  activeTab: TabKey;
  searchTerm: string;
  questions: ForumQuestionSummary[];
  communities: ForumCommunity[];
  answers: AnswerRow[];
};

const TABS: { key: TabKey; label: (n: number) => string }[] = [
  { key: "communities", label: (n) => `Communities (${n})` },
  { key: "questions", label: (n) => `Forum Questions (${n})` },
  { key: "answers", label: (n) => `Forum Answers (${n})` },
];

export default function CommunityManagementTabs({
  activeTab,
  searchTerm: initialSearchTerm,
  questions,
  communities,
  answers,
}: CommunityManagementTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const counts: Record<TabKey, number> = {
    communities: communities.length,
    questions: questions.length,
    answers: answers.length,
  };

  function switchTab(tab: TabKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`/dashboard/admin/community?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    router.push(`/dashboard/admin/community?${params.toString()}`);
  }

  function clearSearch() {
    setSearchTerm("");
    router.push(`/dashboard/admin/community?tab=${activeTab}`);
  }

  const searchPlaceholder =
    activeTab === "communities"
      ? "Search communities by name or category"
      : activeTab === "questions"
        ? "Search questions by title or content"
        : "Search answers by content or question";

  return (
    <div>
      {/* Tab switcher — underline style like the Settings Account/Security tabs */}
      <div className="flex items-center gap-6 border-b border-slate-100">
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => switchTab(t.key)}
              className="relative pb-3 text-sm font-semibold transition"
              style={{ color: active ? "#2563eb" : "#64748b" }}
            >
              {t.label(counts[t.key])}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-wrap gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Search
        </button>
        {initialSearchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Clear
          </button>
        )}
      </form>

      {/* Communities tab */}
      {activeTab === "communities" && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-2 py-3">Name</th>
                <th className="px-2 py-3">Category</th>
                <th className="px-2 py-3">Members</th>
                <th className="px-2 py-3">Posts</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {communities.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-2 py-3 font-semibold text-slate-900">
                    <Link href={`/dashboard/forum/c/${c.slug}`} className="hover:text-teal-700 hover:underline">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-slate-500">{c.category}</td>
                  <td className="px-2 py-3 text-slate-500">{c.member_count}</td>
                  <td className="px-2 py-3 text-slate-500">{c.post_count}</td>
                  <td className="px-2 py-3">
                    <AdminDeleteCommunityButton communityId={c.id} title={c.title} isOfficial={c.is_official} />
                  </td>
                </tr>
              ))}
              {communities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-10 text-center text-slate-400">
                    No communities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Forum Questions tab */}
      {activeTab === "questions" && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-2 py-3">Title</th>
                <th className="px-2 py-3">Author</th>
                <th className="px-2 py-3">Community</th>
                <th className="px-2 py-3">Answers</th>
                <th className="px-2 py-3">Posted</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.question_id} className="border-b border-slate-50 last:border-0">
                  <td className="max-w-xs truncate px-2 py-3 font-semibold text-slate-900">
                    <Link href={`/dashboard/forum/${q.question_id}`} className="hover:text-teal-700 hover:underline">
                      {q.title}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-slate-500">{q.author.fullname}</td>
                  <td className="px-2 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {q.subforum_slug}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-slate-500">{q.answer_count}</td>
                  <td className="px-2 py-3 text-slate-500">{new Date(q.created_at).toLocaleDateString()}</td>
                  <td className="px-2 py-3">
                    <AdminDeleteQuestionButton questionId={q.question_id} title={q.title} />
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-10 text-center text-slate-400">
                    No questions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Forum Answers tab */}
      {activeTab === "answers" && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-2 py-3">Answer</th>
                <th className="px-2 py-3">On question</th>
                <th className="px-2 py-3">Author</th>
                <th className="px-2 py-3">Posted</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {answers.map((a) => (
                <tr key={a.answer_id} className="border-b border-slate-50 last:border-0">
                  <td className="max-w-sm truncate px-2 py-3 text-slate-700">{a.content}</td>
                  <td className="max-w-xs truncate px-2 py-3">
                    <Link href={`/dashboard/forum/${a.questionId}`} className="font-semibold text-teal-700 hover:underline">
                      {a.questionTitle}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-slate-500">{a.authorName}</td>
                  <td className="px-2 py-3 text-slate-500">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="px-2 py-3">
                    <AdminDeleteAnswerButton answerId={a.answer_id} />
                  </td>
                </tr>
              ))}
              {answers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-10 text-center text-slate-400">
                    No answers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}