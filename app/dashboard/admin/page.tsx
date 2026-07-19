import type { Metadata } from "next";
import Link from "next/link";
import { Users, CheckCircle2, MessagesSquare, ShieldOff, Flag, ArrowRight, ArrowUpRight } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TrendBarChart, DonutChart } from "@/components/admin/AdminCharts";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin | SkillBridge",
};

const DAYS_BACK = 14;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDayLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export default async function AdminOverviewPage() {
  const supabase = await createSupabaseServerClient();

  const currentDayStart = startOfDay(new Date());
  const dayStarts = Array.from({ length: DAYS_BACK }, (_, i) => {
    const d = new Date(currentDayStart);
    d.setDate(d.getDate() - (DAYS_BACK - 1 - i));
    return d;
  });
  const rangeStart = dayStarts[0];

  const [
    { count: totalUsers },
    { count: suspendedUsers },
    { count: completedSessions },
    { count: pendingReports },
    { count: totalQuestions },
    { count: totalAnswers },
    { data: recentSignupDates },
    { data: recentCompletedSessionDates },
    { data: recentSignups },
    { data: attentionReports },
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("is_suspended", true),
    supabase.from("session_requests").select("request_id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("reports").select("report_id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("forum_questions").select("question_id", { count: "exact", head: true }),
    supabase.from("forum_answers").select("answer_id", { count: "exact", head: true }),
    supabase.from("users").select("created_at").gte("created_at", rangeStart.toISOString()),
    supabase
      .from("session_requests")
      .select("completed_at")
      .eq("status", "completed")
      .gte("completed_at", rangeStart.toISOString()),
    supabase
      .from("users")
      .select("id, fullname, email, avatar_url, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("reports")
      .select("report_id, report_type, reason, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  // Bucket raw timestamps into the 14 daily windows computed above.
  const days = dayStarts.map((start, i) => {
    const end = i < DAYS_BACK - 1 ? dayStarts[i + 1] : new Date(8640000000000000);
    const signups = (recentSignupDates ?? []).filter((r) => {
      const t = new Date(r.created_at);
      return t >= start && t < end;
    }).length;
    const sessions = (recentCompletedSessionDates ?? []).filter((r) => {
      if (!r.completed_at) return false;
      const t = new Date(r.completed_at);
      return t >= start && t < end;
    }).length;
    return { label: formatDayLabel(start), signups, sessions };
  });

  const signupsThisWeek = days.slice(-7).reduce((sum, d) => sum + d.signups, 0);
  const sessionsThisWeek = days.slice(-7).reduce((sum, d) => sum + d.sessions, 0);
  const forumTotal = (totalQuestions ?? 0) + (totalAnswers ?? 0);

  const heroStats = [
    {
      label: "Total accounts",
      value: totalUsers ?? 0,
      sub: `+${signupsThisWeek} this week`,
      icon: Users,
      gradient: "linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-green) 100%)",
    },
    {
      label: "Completed sessions",
      value: completedSessions ?? 0,
      sub: `+${sessionsThisWeek} this week`,
      icon: CheckCircle2,
      gradient: "linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-blue-deep) 100%)",
    },
    {
      label: "Forum activity",
      value: forumTotal,
      sub: `${totalQuestions ?? 0} questions · ${totalAnswers ?? 0} answers`,
      icon: MessagesSquare,
      gradient: "linear-gradient(135deg, var(--color-brand-green) 0%, #047857 100%)",
    },
  ];

  const reportTypeLabel: Record<string, string> = {
    user: "User",
    forum_question: "Question",
    forum_answer: "Answer",
  };

  return (
    <div className="px-6 py-5 md:px-10 md:py-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Overview</h1>
          <p className="mt-1 text-sm text-gray-500">Real counts from the platform, updated on every load.</p>
        </div>
        {(pendingReports ?? 0) > 0 && (
          <Link
            href="/dashboard/admin/reports"
            className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
          >
            <Flag size={14} />
            {pendingReports} report{pendingReports === 1 ? "" : "s"} waiting for review
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Hero stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {heroStats.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl p-5 text-white shadow-sm"
            style={{ backgroundImage: s.gradient }}
          >
            <s.icon size={64} className="pointer-events-none absolute -right-3 -top-3 text-white/15" strokeWidth={1.5} />
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value.toLocaleString()}</p>
            <p className="mt-1 text-xs font-medium text-white/85">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Secondary flat stats */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ borderLeft: "3px solid var(--color-status-critical)" }}>
            <ShieldOff size={18} className="text-status-critical" />
          </span>
          <div>
            <p className="text-lg font-bold text-slate-900">{suspendedUsers ?? 0}</p>
            <p className="text-xs font-semibold text-slate-500">Suspended accounts</p>
          </div>
        </div>
        <Link
          href="/dashboard/admin/reports"
          className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-brand/30"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ borderLeft: "3px solid var(--color-status-attention)" }}>
            <Flag size={18} className="text-status-attention" />
          </span>
          <div>
            <p className="text-lg font-bold text-slate-900">{pendingReports ?? 0}</p>
            <p className="text-xs font-semibold text-slate-500">Pending reports</p>
          </div>
        </Link>
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Signups &amp; completed sessions (last 14 days)</h2>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-brand-blue)" }} />
                Signups
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-brand-green)" }} />
                Completed sessions
              </span>
            </div>
          </div>
          <div className="mt-4">
            <TrendBarChart buckets={days} showEveryLabel={false} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Content mix</h2>
          <div className="mt-4">
            <DonutChart
              centerLabel="items"
              segments={[
                { label: "Questions", value: totalQuestions ?? 0, color: "var(--color-brand-blue)" },
                { label: "Answers", value: totalAnswers ?? 0, color: "var(--color-brand-green)" },
                { label: "Sessions", value: completedSessions ?? 0, color: "var(--color-status-attention)" },
              ]}
            />
          </div>
          <ul className="mt-4 space-y-2 text-xs">
            {[
              { label: "Questions", value: totalQuestions ?? 0, color: "var(--color-brand-blue)" },
              { label: "Answers", value: totalAnswers ?? 0, color: "var(--color-brand-green)" },
              { label: "Completed sessions", value: completedSessions ?? 0, color: "var(--color-status-attention)" },
            ].map((item) => (
              <li key={item.label} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="font-semibold text-slate-900">{item.value.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Activity lists */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent signups</h2>
            <Link href="/dashboard/admin/users" className="text-xs font-semibold text-brand hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-slate-50">
            {(recentSignups ?? []).map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-2.5">
                <Avatar className="h-8 w-8">
                  {u.avatar_url && <AvatarImage src={u.avatar_url} alt="" />}
                  <AvatarFallback
                    className="text-[11px] font-bold text-white"
                    style={{ backgroundImage: "linear-gradient(135deg, var(--color-brand-blue), var(--color-brand-green))" }}
                  >
                    {getInitials(u.fullname ?? u.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{u.fullname}</p>
                  <p className="truncate text-xs text-slate-500">{u.email}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{timeAgo(u.created_at)}</span>
              </li>
            ))}
            {(recentSignups ?? []).length === 0 && (
              <li className="py-6 text-center text-sm text-slate-400">No signups yet.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Needs attention</h2>
            <Link href="/dashboard/admin/reports" className="text-xs font-semibold text-brand hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-slate-50">
            {(attentionReports ?? []).map((r) => (
              <li key={r.report_id} className="flex items-start gap-3 py-2.5">
                <Flag size={14} className="mt-0.5 shrink-0 text-status-attention" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {reportTypeLabel[r.report_type] ?? r.report_type} report
                  </p>
                  <p className="truncate text-xs text-slate-500">{r.reason}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{timeAgo(r.created_at)}</span>
              </li>
            ))}
            {(attentionReports ?? []).length === 0 && (
              <li className="py-6 text-center text-sm text-slate-400">All caught up — nothing pending.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Quick actions — a menu, not another pair of stat cards */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-50 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
        </div>
        <div className="divide-y divide-slate-50">
          <Link
            href="/dashboard/admin/users"
            className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-wash">
              <Users size={16} className="text-brand-blue" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">Manage users</p>
              <p className="text-xs text-slate-500">Search accounts, suspend, or reactivate</p>
            </div>
            <ArrowUpRight size={16} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
          </Link>
          <Link
            href="/dashboard/admin/reports"
            className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
              <Flag size={16} className="text-status-attention" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">Review flagged content</p>
              <p className="text-xs text-slate-500">Investigate reports on users, questions, and answers</p>
            </div>
            <ArrowUpRight size={16} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
          </Link>
        </div>
      </div>
    </div>
  );
}