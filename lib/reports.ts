import type { SupabaseClient } from "@supabase/supabase-js";

export type ReportType = "forum_question" | "forum_answer" | "user";
export type ReportStatus = "pending" | "reviewed" | "dismissed" | "actioned";

export type CreateReportInput = {
  reporterId: string;
  reportType: ReportType;
  reportedUserId: string;
  questionId?: string | null;
  answerId?: string | null;
  reason?: string;
};

function normalizeReason(reason?: string) {
  return (reason ?? "Reported by user").trim().slice(0, 500) || "Reported by user";
}

/** Prevent duplicate pending reports from the same user for the same target. */
export async function hasPendingReport(
  supabase: SupabaseClient,
  params: {
    reporterId: string;
    reportType: ReportType;
    questionId?: string | null;
    answerId?: string | null;
  }
): Promise<boolean> {
  let query = supabase
    .from("reports")
    .select("report_id")
    .eq("reporter_id", params.reporterId)
    .eq("report_type", params.reportType)
    .eq("status", "pending");

  if (params.reportType === "forum_question") {
    if (!params.questionId) return false;
    query = query.eq("question_id", params.questionId);
  } else if (params.reportType === "forum_answer") {
    if (!params.answerId) return false;
    query = query.eq("answer_id", params.answerId);
  }

  const { data } = await query.maybeSingle();
  return !!data;
}

export async function createReport(
  supabase: SupabaseClient,
  input: CreateReportInput
): Promise<{ error: string | null }> {
  const duplicate = await hasPendingReport(supabase, {
    reporterId: input.reporterId,
    reportType: input.reportType,
    questionId: input.questionId,
    answerId: input.answerId,
  });
  if (duplicate) {
    return { error: "You already reported this content." };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: input.reporterId,
    report_type: input.reportType,
    reported_user_id: input.reportedUserId,
    question_id: input.questionId ?? null,
    answer_id: input.answerId ?? null,
    reason: normalizeReason(input.reason),
    status: "pending" satisfies ReportStatus,
  });

  if (error) return { error: error.message };
  return { error: null };
}
