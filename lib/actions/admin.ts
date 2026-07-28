"use server";

import { revalidatePath } from "next/cache";
import { requireAdminServerAction } from "@/lib/auth/requireAdminAction";
import { tryCreateSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/auth/isAdmin";

/** Admin-only: delete any forum question (and its answers), no report required. */
export async function adminDeleteQuestionAction(params: { questionId: string }) {
  const auth = await requireAdminServerAction();
  if (!auth.ok) return { error: auth.error };

  const admin = tryCreateSupabaseAdminClient();
  const db = admin ?? auth.supabase;

  const { data: question } = await db
    .from("forum_questions")
    .select("question_id")
    .eq("question_id", params.questionId)
    .maybeSingle();

  if (!question) return { error: "Question not found." };

  const { error } = await db.from("forum_questions").delete().eq("question_id", params.questionId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/community");
  revalidatePath("/dashboard/forum");
  return { success: true };
}

/**
 * Admin-only: delete a user-created community. Mirrors deleteCommunity() in
 * lib/forumCommunities.ts but bypasses the created_by ownership check —
 * official/built-in communities still can't be deleted either way.
 */
export async function adminDeleteCommunityAction(params: { communityId: string }) {
  const auth = await requireAdminServerAction();
  if (!auth.ok) return { error: auth.error };

  const admin = tryCreateSupabaseAdminClient();
  const db = admin ?? auth.supabase;

  const { data: existing, error: lookupError } = await db
    .from("forum_communities")
    .select("id, slug, is_official")
    .eq("id", params.communityId)
    .maybeSingle();

  if (lookupError) return { error: lookupError.message };
  if (!existing) return { error: "Community not found." };

  // Keep posts discoverable under General after the community is gone.
  await db.from("forum_questions").update({ subforum_slug: "general" }).eq("subforum_slug", existing.slug);

  const { error } = await db.from("forum_communities").delete().eq("id", params.communityId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/community");
  revalidatePath("/dashboard/forum");
  return { success: true };
}

/**
 * Admin-only: generate a working activation link directly via the Admin API,
 * bypassing email entirely. This is a magic link, not the original
 * confirm-signup link — Supabase doesn't expose a way to regenerate that
 * specific link type for an existing user without their password — but
 * clicking it confirms the user's email and logs them in, which is the
 * outcome that matters here.
 */
export async function adminGenerateActivationLinkAction(params: { email: string }) {
  const auth = await requireAdminServerAction();
  if (!auth.ok) return { error: auth.error };

  const admin = tryCreateSupabaseAdminClient();
  if (!admin) {
    return { error: "Admin client not configured (missing SUPABASE_SERVICE_ROLE_KEY)." };
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: params.email,
  });

  if (error) return { error: error.message };

  const link = data?.properties?.action_link;
  if (!link) return { error: "Supabase did not return a link." };

  return { success: true, link };
}

export async function setUserSuspensionAction(params: {
  userId: string;
  suspend: boolean;
  reason?: string;
}) {
  const auth = await requireAdminServerAction();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  if (params.userId === user.id) {
    return { error: "You can't suspend your own account." };
  }

  if (await isAdminUser(supabase, params.userId)) {
    return { error: "Can't suspend another admin account." };
  }

  const admin = tryCreateSupabaseAdminClient();
  const db = admin ?? supabase;

  const { error } = await db
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
  const auth = await requireAdminServerAction();
  if (!auth.ok) return { error: auth.error };
  const { supabase } = auth;

  const admin = tryCreateSupabaseAdminClient();
  const db = admin ?? supabase;

  const { error } = await db
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
  const auth = await requireAdminServerAction();
  if (!auth.ok) return { error: auth.error };
  const { supabase } = auth;

  const { data: report } = await supabase
    .from("reports")
    .select("report_id, report_type, question_id, answer_id, status")
    .eq("report_id", params.reportId)
    .maybeSingle();

  if (!report) return { error: "Report not found." };
  if (report.report_type !== params.reportType) {
    return { error: "Report type mismatch." };
  }

  const admin = tryCreateSupabaseAdminClient();
  const db = admin ?? supabase;

  if (params.reportType === "forum_question") {
    const questionId = report.question_id;
    if (!questionId) return { error: "Report has no question to delete." };
    const { error } = await db.from("forum_questions").delete().eq("question_id", questionId);
    if (error) return { error: error.message };
  } else if (params.reportType === "forum_answer") {
    const answerId = report.answer_id;
    if (!answerId) return { error: "Report has no answer to delete." };
    const { error } = await db.from("forum_answers").delete().eq("answer_id", answerId);
    if (error) return { error: error.message };
  } else {
    return { error: "Nothing to delete for this report." };
  }

  const { error: statusError } = await db
    .from("reports")
    .update({ status: "actioned" })
    .eq("report_id", params.reportId);

  if (statusError) return { error: statusError.message };

  revalidatePath("/dashboard/admin/reports");
  revalidatePath("/dashboard/forum");
  return { success: true };
}
const BADGE_METRICS = [
  "skills_offered_count",
  "offered_and_wanted",
  "sessions_completed",
  "review_count",
  "level",
  "trusted_teacher",
  "member_days",
] as const;

const BADGE_TIERS = ["common", "rare", "epic", "legendary"] as const;

type BadgeInput = {
  name: string;
  description: string;
  tier: (typeof BADGE_TIERS)[number];
  icon: string;
  metric: (typeof BADGE_METRICS)[number];
  target: number;
  sort_order: number;
  is_active: boolean;
};

export async function createBadgeAction(input: BadgeInput) {
  "use server";
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("badges").insert(input);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateBadgeAction(id: string, input: Partial<BadgeInput>) {
  "use server";
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("badges").update(input).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteBadgeAction(id: string) {
  "use server";
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("badges").update({ is_active: false }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}