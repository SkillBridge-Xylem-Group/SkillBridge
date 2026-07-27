import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getForumQuestions } from "@/lib/forum";
import { listCommunities } from "@/lib/forumCommunities";
import AdminDeleteQuestionButton from "@/components/admin/AdminDeleteQuestionButton";
import AdminDeleteCommunityButton from "@/components/admin/AdminDeleteCommunityButton";

export const metadata: Metadata = {
  title: "Community | Admin | SkillBridge",
};

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminCommunityPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const term = q?.trim();

  const supabase = await createSupabaseServerClient();

  const [questions, allCommunities] = await Promise.all([
    getForumQuestions(supabase, { search: term, limit: 100 }),
    listCommunities(supabase),
  ]);

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
      <p className="mt-1 text-sm text-gray-500">Browse questions and communities across the platform.</p>

      <form method="GET" className="mt-6 flex flex-wrap gap-2">
        <input
          type="text"
          name="q"
          defaultValue={term ?? ""}
          placeholder="Search questions by title or content"
          className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Search
        </button>
        {term && (
          <Link
            href="/dashboard/admin/community"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Clear
          </Link>
        )}
      </form>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Questions ({questions.length})
        {term ? ` matching "${term}"` : ""}
      </h2>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Community</th>
              <th className="px-4 py-3">Answers</th>
              <th className="px-4 py-3">Posted</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.question_id} className="border-b border-slate-50 last:border-0">
                <td className="max-w-xs truncate px-4 py-3 font-semibold text-slate-900">
  <Link
    href={`/dashboard/forum/${q.question_id}`}
    className="hover:text-teal-700 hover:underline"
  >
    {q.title}
  </Link>
</td>
                <td className="px-4 py-3 text-slate-500">{q.author.fullname}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {q.subforum_slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{q.answer_count}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(q.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <AdminDeleteQuestionButton questionId={q.question_id} title={q.title} />
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No questions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Communities ({communities.length})
        {term ? ` matching "${term}"` : ""}
      </h2>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Posts</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {communities.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-900">
  <Link
    href={`/dashboard/forum/c/${c.slug}`}
    className="hover:text-teal-700 hover:underline"
  >
    {c.title}
  </Link>
</td>
                <td className="px-4 py-3 text-slate-500">{c.category}</td>
                <td className="px-4 py-3 text-slate-500">{c.member_count}</td>
                <td className="px-4 py-3 text-slate-500">{c.post_count}</td>
                <td className="px-4 py-3">
                  <AdminDeleteCommunityButton
                    communityId={c.id}
                    title={c.title}
                    isOfficial={c.is_official}
                  />
                </td>
              </tr>
            ))}
            {communities.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  No communities found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
