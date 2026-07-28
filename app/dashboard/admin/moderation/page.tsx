import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminDeleteQuestionButton from "@/components/admin/AdminDeleteQuestionButton";

export const metadata: Metadata = {
  title: "Forum Moderation | Admin | SkillBridge",
};

export default async function ForumModerationPage() {
  const supabase = await createSupabaseServerClient();

  const { data: questions, error } = await supabase
    .from("forum_questions")
    .select("question_id, title, content, user_id, created_at, users:user_id (fullname)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-semibold text-gray-900">Forum Moderation</h1>
      <p className="mt-1 text-sm text-gray-500">Most recent posts across all communities.</p>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Failed to load posts: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Post</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(questions ?? []).map((q: any) => (
              <tr key={q.question_id} className="border-b border-slate-50 last:border-0">
                <td className="max-w-xs truncate px-4 py-3 font-semibold text-slate-900">
                  <Link
                    href={`/dashboard/forum/${q.question_id}`}
                    className="hover:text-teal-700 hover:underline"
                  >
                    {q.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{q.users?.fullname ?? "Unknown"}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(q.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <AdminDeleteQuestionButton questionId={q.question_id} title={q.title} />
                </td>
              </tr>
            ))}
            {(!questions || questions.length === 0) && !error && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                  No posts.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}