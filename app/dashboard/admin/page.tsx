import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin | SkillBridge",
};

export default async function AdminOverviewPage() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: totalUsers },
    { count: suspendedUsers },
    { count: completedSessions },
    { count: pendingReports },
    { count: totalQuestions },
    { count: totalAnswers },
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("is_suspended", true),
    supabase.from("session_requests").select("request_id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("reports").select("report_id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("forum_questions").select("question_id", { count: "exact", head: true }),
    supabase.from("forum_answers").select("answer_id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total accounts", value: totalUsers ?? 0 },
    { label: "Suspended accounts", value: suspendedUsers ?? 0 },
    { label: "Completed sessions", value: completedSessions ?? 0 },
    { label: "Forum questions", value: totalQuestions ?? 0 },
    { label: "Forum answers", value: totalAnswers ?? 0 },
  ];

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Overview</h1>
      <p className="mt-1 text-sm text-gray-500">Real counts from the platform, updated on every load.</p>

      {(pendingReports ?? 0) > 0 && (
        <Link
          href="/dashboard/admin/reports"
          className="mt-6 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800 hover:bg-amber-100"
        >
          <span>
            {pendingReports} report{pendingReports === 1 ? "" : "s"} waiting for review
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/admin/users"
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-brand/30"
        >
          <p className="font-semibold text-slate-900">Manage users</p>
          <p className="mt-1 text-sm text-slate-500">Search accounts, suspend or reactivate.</p>
        </Link>
        <Link
          href="/dashboard/admin/reports"
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-brand/30"
        >
          <p className="font-semibold text-slate-900">Review flagged content</p>
          <p className="mt-1 text-sm text-slate-500">Handle reports on users, questions, and answers.</p>
        </Link>
      </div>
    </div>
  );
}