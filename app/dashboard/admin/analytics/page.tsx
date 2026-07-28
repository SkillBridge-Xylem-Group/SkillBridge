import type { Metadata } from "next";
import { Users, MessagesSquare, Repeat2, Flag } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TrendBarChart, DonutChart } from "@/components/admin/AdminCharts";

export const metadata: Metadata = {
  title: "Analytics | Admin | SkillBridge",
};

const DAYS_BACK = 30;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDayLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function AdminAnalyticsPage() {
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
    { count: totalSessions },
    { count: pendingReports },
    { count: resolvedReports },
    { data: signupDates },
    { data: completedSessionDates },
    { data: reportsByType },
    { data: sessionsByStatus },
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("session_requests").select("request_id", { count: "exact", head: true }),
    supabase.from("reports").select("report_id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reports").select("report_id", { count: "exact", head: true }).in("status", ["reviewed", "dismissed", "actioned"]),
    supabase.from("users").select("created_at").gte("created_at", rangeStart.toISOString()),
    supabase
      .from("session_requests")
      .select("completed_at")
      .eq("status", "completed")
      .gte("completed_at", rangeStart.toISOString()),
    supabase.from("reports").select("report_type"),
    supabase.from("session_requests").select("status"),
  ]);

  const days = dayStarts.map((start, i) => {
    const end = i < DAYS_BACK - 1 ? dayStarts[i + 1] : new Date(8640000000000000);
    const signups = (signupDates ?? []).filter((r) => {
      const t = new Date(r.created_at);
      return t >= start && t < end;
    }).length;
    const sessions = (completedSessionDates ?? []).filter((r) => {
      if (!r.completed_at) return false;
      const t = new Date(r.completed_at);
      return t >= start && t < end;
    }).length;
    return { label: formatDayLabel(start), signups, sessions };
  });

  const reportTypeCounts = (reportsByType ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.report_type] = (acc[r.report_type] ?? 0) + 1;
    return acc;
  }, {});

  const statusCounts = (sessionsByStatus ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  const reportTypeLabel: Record<string, string> = {
    user: "User reports",
    forum_question: "Question reports",
    forum_answer: "Answer reports",
  };

  const statCards = [
    { label: "Total accounts", value: totalUsers ?? 0, icon: Users, gradient: "var(--sb-gradient)" },
    { label: "Total sessions", value: totalSessions ?? 0, icon: Repeat2, gradient: "linear-gradient(135deg, var(--sb-teal), var(--sb-teal-dark))" },
    { label: "Pending reports", value: pendingReports ?? 0, icon: Flag, gradient: "linear-gradient(135deg, #f59e0b, #b45309)" },
    { label: "Resolved reports", value: resolvedReports ?? 0, icon: MessagesSquare, gradient: "linear-gradient(135deg, var(--sb-emerald), var(--sb-emerald-dark))" },
  ];

  return (
    <div className="px-6 py-5 md:px-10 md:py-7">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--sb-ink)" }}>Analytics</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--sb-muted)" }}>
        Platform-wide trends over the last {DAYS_BACK} days.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl p-5 text-white"
            style={{ backgroundImage: s.gradient, boxShadow: "var(--sb-shadow-sm)" }}
          >
            <s.icon size={56} className="pointer-events-none absolute -right-3 -top-3 text-white/15" strokeWidth={1.5} />
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 lg:col-span-2" style={{ boxShadow: "var(--sb-shadow-sm)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>
            Signups &amp; completed sessions (last {DAYS_BACK} days)
          </h2>
          <div className="mt-4">
            <TrendBarChart buckets={days} showEveryLabel={false} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "var(--sb-shadow-sm)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>Report breakdown</h2>
          <div className="mt-4">
            <DonutChart
              centerLabel="reports"
              segments={Object.entries(reportTypeCounts).map(([type, value], i) => ({
                label: reportTypeLabel[type] ?? type,
                value,
                color: ["var(--sb-teal-dark)", "var(--sb-emerald)", "var(--sb-tint-amber-ink)"][i % 3],
              }))}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5" style={{ boxShadow: "var(--sb-shadow-sm)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>Session status breakdown</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xl font-bold" style={{ color: "var(--sb-ink)" }}>{count}</p>
              <p className="mt-0.5 text-xs capitalize" style={{ color: "var(--sb-muted)" }}>{status}</p>
            </div>
          ))}
          {Object.keys(statusCounts).length === 0 && (
            <p className="col-span-full py-4 text-center text-sm" style={{ color: "var(--sb-muted)" }}>
              No sessions yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}