import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ReportStatusControl from "@/components/admin/ReportStatusControl";
import DeleteContentButton from "@/components/admin/DeleteContentButton";
import SuspendToggleButton from "@/components/admin/SuspendToggleButton";

export const metadata: Metadata = {
  title: "Flagged Content | Admin | SkillBridge",
};

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const STATUS_TABS = ["pending", "reviewed", "dismissed", "actioned", "all"] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  reviewed: "bg-blue-50 text-blue-700",
  dismissed: "bg-slate-100 text-slate-500",
  actioned: "bg-red-50 text-red-600",
};

type UserRow = { id: string; fullname: string; email: string; is_suspended: boolean };
type QuestionRow = { question_id: string; title: string; user_id: string };
type AnswerRow = { answer_id: string; content: string; question_id: string; user_id: string };

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams;
  const status = STATUS_TABS.includes(statusParam as (typeof STATUS_TABS)[number])
    ? statusParam!
    : "pending";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  let reportsQuery = supabase
    .from("reports")
    .select(
      "report_id, reporter_id, report_type, reported_user_id, question_id, answer_id, reason, status, created_at"
    )
    .order("created_at", { ascending: false });

  if (status !== "all") {
    reportsQuery = reportsQuery.eq("status", status);
  }

  const { data: reports, error } = await reportsQuery;
  const reportList = reports ?? [];

  const questionIds = [...new Set(reportList.map((r) => r.question_id).filter((v): v is string => !!v))];
  const answerIds = [...new Set(reportList.map((r) => r.answer_id).filter((v): v is string => !!v))];
  const directUserIds = [...new Set(reportList.map((r) => r.reported_user_id).filter((v): v is string => !!v))];

  const [{ data: questions }, { data: answers }] = await Promise.all([
    questionIds.length
      ? supabase.from("forum_questions").select("question_id, title, user_id").in("question_id", questionIds)
      : Promise.resolve({ data: [] as QuestionRow[] }),
    answerIds.length
      ? supabase.from("forum_answers").select("answer_id, content, question_id, user_id").in("answer_id", answerIds)
      : Promise.resolve({ data: [] as AnswerRow[] }),
  ]);

  const questionMap = new Map((questions ?? []).map((q) => [q.question_id, q]));
  const answerMap = new Map((answers ?? []).map((a) => [a.answer_id, a]));

  const allUserIds = new Set<string>();
  reportList.forEach((r) => {
    allUserIds.add(r.reporter_id);
    if (r.reported_user_id) allUserIds.add(r.reported_user_id);
  });
  (questions ?? []).forEach((q) => allUserIds.add(q.user_id));
  (answers ?? []).forEach((a) => allUserIds.add(a.user_id));
  directUserIds.forEach((id) => allUserIds.add(id));

  const { data: users } = allUserIds.size
    ? await supabase.from("users").select("id, fullname, email, is_suspended").in("id", [...allUserIds])
    : { data: [] as UserRow[] };
  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const items = reportList.map((r) => {
    const reporter = userMap.get(r.reporter_id);
    let targetLabel = "Unknown";
    let targetDetail = "";
    let targetUserId: string | null = null;

    if (r.report_type === "user") {
      const u = r.reported_user_id ? userMap.get(r.reported_user_id) : undefined;
      targetLabel = u?.fullname ?? "Unknown user";
      targetDetail = u?.email ?? "";
      targetUserId = r.reported_user_id ?? null;
    } else if (r.report_type === "forum_question") {
      const q = r.question_id ? questionMap.get(r.question_id) : undefined;
      targetLabel = q?.title ?? "Unknown question";
      targetDetail = q ? `posted by ${userMap.get(q.user_id)?.fullname ?? "unknown"}` : "";
      targetUserId = q?.user_id ?? null;
    } else if (r.report_type === "forum_answer") {
      const a = r.answer_id ? answerMap.get(r.answer_id) : undefined;
      targetLabel = a ? a.content.slice(0, 80) + (a.content.length > 80 ? "…" : "") : "Unknown answer";
      targetDetail = a ? `answered by ${userMap.get(a.user_id)?.fullname ?? "unknown"}` : "";
      targetUserId = a?.user_id ?? null;
    }

    const targetUser = targetUserId ? userMap.get(targetUserId) : undefined;

    return {
      ...r,
      reporterName: reporter?.fullname ?? "Unknown",
      targetLabel,
      targetDetail,
      targetUserId,
      targetUserIsSuspended: targetUser?.is_suspended ?? false,
      canSuspendTarget: !!targetUserId && targetUserId !== viewer?.id,
    };
  });

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-semibold text-gray-900">Flagged Content</h1>
      <p className="mt-1 text-sm text-gray-500">
        {items.length} report{items.length === 1 ? "" : "s"}
        {status !== "all" ? ` · ${status}` : ""}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab}
            href={tab === "pending" ? "/dashboard/admin/reports" : `/dashboard/admin/reports?status=${tab}`}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              status === tab ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-100"
            }`}
          >
            {tab}
          </Link>
        ))}
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Failed to load reports: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Reported</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Reported by</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.report_id} className="border-b border-slate-50 align-top last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{r.targetLabel}</p>
                  <p className="text-xs text-slate-400">
                    {r.report_type.replace("forum_", "")}
                    {r.targetDetail ? ` · ${r.targetDetail}` : ""}
                  </p>
                  {r.report_type === "forum_question" && r.question_id ? (
                    <Link
                      href={`/dashboard/forum/${r.question_id}`}
                      className="mt-1 inline-block text-xs font-semibold text-teal-700 hover:underline"
                    >
                      View post
                    </Link>
                  ) : null}
                  {r.report_type === "forum_answer" && r.question_id ? (
                    <Link
                      href={`/dashboard/forum/${r.question_id}${r.answer_id ? `#comment-${r.answer_id}` : ""}`}
                      className="mt-1 inline-block text-xs font-semibold text-teal-700 hover:underline"
                    >
                      View comment
                    </Link>
                  ) : null}
                </td>
                <td className="px-4 py-3 max-w-xs text-slate-500">{r.reason}</td>
                <td className="px-4 py-3 text-slate-500">{r.reporterName}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[r.status] ?? "bg-slate-100 text-slate-500"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-end gap-2">
                    {(r.report_type === "forum_question" || r.report_type === "forum_answer") && (
                      <DeleteContentButton
                        reportId={r.report_id}
                        reportType={r.report_type as "forum_question" | "forum_answer"}
                        questionId={r.question_id}
                        answerId={r.answer_id}
                      />
                    )}
                    {r.canSuspendTarget && (
                      <SuspendToggleButton userId={r.targetUserId!} isSuspended={r.targetUserIsSuspended} />
                    )}
                    <ReportStatusControl reportId={r.report_id} currentStatus={r.status} />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No reports{status !== "all" ? ` with status "${status}"` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}