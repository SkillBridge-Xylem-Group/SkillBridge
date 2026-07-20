"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth/isAdmin";

export async function setUserSuspensionAction(params: {
  userId: string;
  suspend: boolean;
  reason?: string;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };
  if (!(await isAdminUser(supabase, user.id))) return { error: "Not authorized." };

  if (params.userId === user.id) {
    return { error: "You can't suspend your own account." };
  }

  if (await isAdminUser(supabase, params.userId)) {
    return { error: "Can't suspend another admin account." };
  }

  const { error } = await supabase
    .from("users")
    .update({
      is_suspended: params.suspend,
      suspended_at: params.suspend ? new Date().toISOString() : null,
      suspended_reason: params.suspend ? params.reason?.trim() || null : null,
    })
    .eq("id", params.userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function updateReportStatusAction(params: {
  reportId: string;
  status: "pending" | "reviewed" | "dismissed" | "actioned";
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };
  if (!(await isAdminUser(supabase, user.id))) return { error: "Not authorized." };

  const { error } = await supabase
    .from("reports")
    .update({ status: params.status })
    .eq("report_id", params.reportId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/reports");
  return { success: true };
}

export async function deleteReportedContentAction(params: {
  reportId: string;
  reportType: "forum_question" | "forum_answer";
  questionId?: string | null;
  answerId?: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };
  if (!(await isAdminUser(supabase, user.id))) return { error: "Not authorized." };

  const { data: report } = await supabase
    .from("reports")
    .select("report_id, report_type, question_id, answer_id, status")
    .eq("report_id", params.reportId)
    .maybeSingle();

  if (!report) return { error: "Report not found." };
  if (report.report_type !== params.reportType) {
    return { error: "Report type mismatch." };
  }

  if (params.reportType === "forum_question") {
    const questionId = report.question_id;
    if (!questionId) return { error: "Report has no question to delete." };
    const { error } = await supabase.from("forum_questions").delete().eq("question_id", questionId);
    if (error) return { error: error.message };
  } else if (params.reportType === "forum_answer") {
    const answerId = report.answer_id;
    if (!answerId) return { error: "Report has no answer to delete." };
    const { error } = await supabase.from("forum_answers").delete().eq("answer_id", answerId);
    if (error) return { error: error.message };
  } else {
    return { error: "Nothing to delete for this report." };
  }

  const { error: statusError } = await supabase
    .from("reports")
    .update({ status: "actioned" })
    .eq("report_id", params.reportId);

  if (statusError) return { error: statusError.message };

  revalidatePath("/dashboard/admin/reports");
  revalidatePath("/dashboard/forum");
  return { success: true };
}