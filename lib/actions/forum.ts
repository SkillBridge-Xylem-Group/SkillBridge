"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireActiveServerUser } from "@/lib/auth/requireActiveServerUser";
import {
  ACTION_RATE_LIMITS,
  actionRateLimitError,
  checkUserActionRateLimit,
} from "@/lib/auth/action-rate-limit";
import { createQuestion, createAnswer, setAnswerVote, deleteAnswer, deleteQuestion } from "@/lib/forum";
import { createNotification } from "@/lib/notifications";
import { getSafeForumImageUrl } from "@/lib/forumImageUrl";
import { forumSubforumPath } from "@/lib/forumSubforums";
import {
  createCommunity,
  deleteCommunity,
  isKnownCommunitySlug,
  canUserParticipateInCommunity,
  FORUM_JOIN_REQUIRED,
  joinCommunity,
  leaveCommunity,
  updateCommunityAccent,
  updateCommunityBanner,
  updateCommunityDetails,
  updateCommunityImage,
} from "@/lib/forumCommunities";
import { composeReportReason, isReportReasonKey } from "@/lib/forumReportReasons";
import { createReport } from "@/lib/reports";
import { awardForumPostXp, awardForumAnswerXp } from "@/lib/gamification";

async function requireQuestionParticipation(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  questionId: string,
  userId: string
) {
  const { data: question } = await supabase
    .from("forum_questions")
    .select("subforum_slug")
    .eq("question_id", questionId)
    .maybeSingle();
  if (!question) return { error: "Post not found." };
  const canParticipate = await canUserParticipateInCommunity(
    supabase,
    question.subforum_slug,
    userId
  );
  if (!canParticipate) return { error: FORUM_JOIN_REQUIRED };
  return { question };
}

async function verifyAnswerBelongsToQuestion(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  answerId: string,
  questionId: string
) {
  const { data } = await supabase
    .from("forum_answers")
    .select("answer_id")
    .eq("answer_id", answerId)
    .eq("question_id", questionId)
    .maybeSingle();
  if (!data) return { error: "Comment not found." };
  return { ok: true as const };
}

export async function createQuestionAction(
  title: string,
  content: string,
  imageUrl?: string | null,
  subforumSlug?: string | null
) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;

  const postLimit = await checkUserActionRateLimit(
    ACTION_RATE_LIMITS.forumPost.bucket,
    user.id,
    ACTION_RATE_LIMITS.forumPost.max,
    ACTION_RATE_LIMITS.forumPost.windowMs
  );
  if (!postLimit.allowed) return { error: actionRateLimitError(postLimit.retryAfterMs) };

  if (!title.trim()) return { error: "Title can't be empty." };
  if (!content.trim() && !imageUrl?.trim()) {
    return { error: "Add some details or an image before posting." };
  }
  if (!subforumSlug || !(await isKnownCommunitySlug(supabase, subforumSlug))) {
    return { error: "Choose a community to post in." };
  }

  const canParticipate = await canUserParticipateInCommunity(supabase, subforumSlug, user.id);
  if (!canParticipate) return { error: FORUM_JOIN_REQUIRED };

  const safeImageUrl = getSafeForumImageUrl(imageUrl);

  if (imageUrl?.trim() && !safeImageUrl) {
    return { error: "Invalid image URL." };
  }

  const { data, error } = await createQuestion(supabase, {
    userId: user.id,
    title: title.trim(),
    content: content.trim(),
    imageUrl: safeImageUrl,
    subforumSlug,
  });
  if (error) return { error: error.message };

  await awardForumPostXp(supabase, user.id);

  revalidatePath("/dashboard/forum");
  revalidatePath(forumSubforumPath(subforumSlug));
  return { success: true, questionId: data?.question_id, subforumSlug };
}

export async function createCommunityAction(input: {
  title: string;
  slug: string;
  description: string;
  category: string;
  visibility?: "public" | "restricted" | "private";
  accentColor?: string;
  imageUrl?: string | null;
  bannerUrl?: string | null;
}) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;

  const safeImageUrl = getSafeForumImageUrl(input.imageUrl);
  if (input.imageUrl?.trim() && !safeImageUrl) {
    return { error: "Invalid community icon image." };
  }

  const safeBannerUrl = getSafeForumImageUrl(input.bannerUrl);
  if (input.bannerUrl?.trim() && !safeBannerUrl) {
    return { error: "Invalid community banner image." };
  }

  const { data, error } = await createCommunity(supabase, {
    userId: user.id,
    title: input.title,
    slug: input.slug,
    description: input.description,
    category: input.category,
    visibility: input.visibility,
    accentColor: input.accentColor,
    imageUrl: safeImageUrl,
    bannerUrl: safeBannerUrl,
  });

  if (error) {
    if (error.message?.toLowerCase().includes("duplicate") || error.message?.includes("unique")) {
      return { error: "That community name/URL is already taken." };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard/forum");
  revalidatePath("/dashboard", "layout");
  if (data?.slug) revalidatePath(forumSubforumPath(data.slug));
  return { success: true, slug: data?.slug };
}

export async function updateCommunityImageAction(communityId: string, imageUrl: string | null) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;
  if (communityId.startsWith("static-")) {
    return { error: "This community can’t be edited." };
  }

  const safeImageUrl = imageUrl === null ? null : getSafeForumImageUrl(imageUrl);
  if (imageUrl?.trim() && !safeImageUrl) {
    return { error: "Invalid community icon image." };
  }

  const { data, error } = await updateCommunityImage(supabase, {
    communityId,
    userId: user.id,
    imageUrl: safeImageUrl,
  });

  if (error) return { error: error.message };
  if (!data) return { error: "Only the community creator can change the icon." };

  revalidatePath("/dashboard/forum");
  revalidatePath("/dashboard", "layout");
  if (data.slug) revalidatePath(forumSubforumPath(data.slug));
  return { success: true };
}

export async function updateCommunityDetailsAction(
  communityId: string,
  input: { title: string; description: string }
) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;
  if (communityId.startsWith("static-")) {
    return { error: "This community can’t be edited." };
  }

  const { data, error } = await updateCommunityDetails(supabase, {
    communityId,
    userId: user.id,
    title: input.title,
    description: input.description,
  });

  if (error) return { error: error.message };
  if (!data) return { error: "Only the community creator can edit it." };

  revalidatePath("/dashboard/forum");
  revalidatePath("/dashboard", "layout");
  if (data.slug) revalidatePath(forumSubforumPath(data.slug));
  return { success: true, slug: data.slug };
}

export async function updateCommunityBannerAction(communityId: string, bannerUrl: string | null) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;
  if (communityId.startsWith("static-")) {
    return { error: "This community can’t be edited." };
  }

  const safeBannerUrl = bannerUrl === null ? null : getSafeForumImageUrl(bannerUrl);
  if (bannerUrl?.trim() && !safeBannerUrl) {
    return { error: "Invalid community banner image." };
  }

  const { data, error } = await updateCommunityBanner(supabase, {
    communityId,
    userId: user.id,
    bannerUrl: safeBannerUrl,
  });

  if (error) return { error: error.message };
  if (!data) return { error: "Only the community creator can change the banner." };

  revalidatePath("/dashboard/forum");
  revalidatePath("/dashboard", "layout");
  if (data.slug) revalidatePath(forumSubforumPath(data.slug));
  return { success: true };
}

export async function updateCommunityAccentAction(communityId: string, accentColor: string) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;
  if (communityId.startsWith("static-")) {
    return { error: "This community can’t be edited." };
  }

  const { data, error } = await updateCommunityAccent(supabase, {
    communityId,
    userId: user.id,
    accentColor,
  });

  if (error) return { error: error.message };
  if (!data) return { error: "Only the community creator can change the color." };

  revalidatePath("/dashboard/forum");
  revalidatePath("/dashboard", "layout");
  if (data.slug) revalidatePath(forumSubforumPath(data.slug));
  return { success: true };
}

export async function toggleJoinCommunityAction(communityId: string, currentlyJoined: boolean) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;

  let resolvedId = communityId;
  if (communityId.startsWith("static-")) {
    const slug = communityId.slice("static-".length);
    const { data: row } = await supabase
      .from("forum_communities")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!row?.id) {
      return { error: "This community isn’t set up in the database yet. Run the forum communities SQL migration." };
    }
    resolvedId = row.id;
  }

  if (currentlyJoined) {
    const { data: community } = await supabase
      .from("forum_communities")
      .select("created_by")
      .eq("id", resolvedId)
      .maybeSingle();
    if (community?.created_by === user.id) {
      return { error: "You created this community — delete it from the community page if you want it gone." };
    }
  }

  const result = currentlyJoined
    ? await leaveCommunity(supabase, resolvedId, user.id)
    : await joinCommunity(supabase, resolvedId, user.id);

  if (result.error) return { error: result.error.message };

  revalidatePath("/dashboard/forum");
  revalidatePath("/dashboard", "layout");
  return { success: true, joined: !currentlyJoined };
}

export async function deleteCommunityAction(communityId: string) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;
  if (communityId.startsWith("static-")) {
    return { error: "This community can’t be deleted." };
  }

  const { data, error } = await deleteCommunity(supabase, {
    communityId,
    userId: user.id,
  });

  if (error) return { error: error.message };
  if (!data) return { error: "Could not delete this community." };

  revalidatePath("/dashboard/forum");
  revalidatePath("/dashboard", "layout");
  if (data.slug) revalidatePath(forumSubforumPath(data.slug));
  return { success: true };
}

export async function createAnswerAction(
  questionId: string,
  content: string,
  imageUrl?: string | null,
  parentAnswerId?: string | null
) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;

  const commentLimit = await checkUserActionRateLimit(
    ACTION_RATE_LIMITS.forumComment.bucket,
    user.id,
    ACTION_RATE_LIMITS.forumComment.max,
    ACTION_RATE_LIMITS.forumComment.windowMs
  );
  if (!commentLimit.allowed) return { error: actionRateLimitError(commentLimit.retryAfterMs) };

  if (!content.trim() && !imageUrl?.trim()) {
    return { error: "Add a comment or an image before posting." };
  }

  const safeImageUrl = getSafeForumImageUrl(imageUrl);

  if (imageUrl?.trim() && !safeImageUrl) {
    return { error: "Invalid image URL." };
  }

  const { data: question } = await supabase
    .from("forum_questions")
    .select("user_id, title, subforum_slug")
    .eq("question_id", questionId)
    .maybeSingle();

  if (!question) return { error: "Post not found." };

  const canParticipate = await canUserParticipateInCommunity(
    supabase,
    question.subforum_slug,
    user.id
  );
  if (!canParticipate) return { error: FORUM_JOIN_REQUIRED };

  let parentAuthorId: string | null = null;
  if (parentAnswerId) {
    const { data: parentRow } = await supabase
      .from("forum_answers")
      .select("user_id, question_id")
      .eq("answer_id", parentAnswerId)
      .maybeSingle();
    if (!parentRow || parentRow.question_id !== questionId) {
      return { error: "Parent comment not found." };
    }
    parentAuthorId = parentRow.user_id;
  }

  const { data: created, error } = await createAnswer(supabase, {
    questionId,
    userId: user.id,
    content: content.trim(),
    imageUrl: safeImageUrl,
    parentAnswerId: parentAnswerId ?? null,
  });
  if (error) return { error: error.message };

  await awardForumAnswerXp(supabase, user.id);

  const { data: authorRow } = await supabase.from("users").select("fullname").eq("id", user.id).maybeSingle();
  const authorName = authorRow?.fullname ?? "Someone";

  if (question && question.user_id !== user.id) {
    await createNotification(supabase, {
      userId: question.user_id,
      type: "forum_reply",
      message: `${authorName} replied to "${question.title.slice(0, 60)}"`,
      relatedEntityType: "forum_question",
      relatedEntityId: questionId,
    });
  }

  if (
    parentAuthorId &&
    parentAuthorId !== user.id &&
    parentAuthorId !== question?.user_id
  ) {
    await createNotification(supabase, {
      userId: parentAuthorId,
      type: "forum_reply",
      message: `${authorName} replied to your comment`,
      relatedEntityType: "forum_question",
      relatedEntityId: questionId,
    });
  }

  revalidatePath(`/dashboard/forum/${questionId}`);
  return { success: true, answerId: created?.answer_id as string | undefined };
}

export async function setVoteAction(answerId: string, questionId: string, value: -1 | 0 | 1) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;
  if (value !== -1 && value !== 0 && value !== 1) {
    return { error: "Invalid vote." };
  }

  const participation = await requireQuestionParticipation(supabase, questionId, user.id);
  if ("error" in participation) return { error: participation.error };

  const answerCheck = await verifyAnswerBelongsToQuestion(supabase, answerId, questionId);
  if ("error" in answerCheck) return { error: answerCheck.error };

  const { error } = await setAnswerVote(supabase, { answerId, userId: user.id, value });
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/forum/${questionId}`);
  return { success: true };
}

/** @deprecated use setVoteAction */
export async function toggleVoteAction(answerId: string, questionId: string) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;

  const participation = await requireQuestionParticipation(supabase, questionId, user.id);
  if ("error" in participation) return { error: participation.error };

  const answerCheck = await verifyAnswerBelongsToQuestion(supabase, answerId, questionId);
  if ("error" in answerCheck) return { error: answerCheck.error };

  const { data: existing } = await supabase
    .from("answer_votes")
    .select("vote_id")
    .eq("answer_id", answerId)
    .eq("user_id", user.id)
    .maybeSingle();

  const next: -1 | 0 | 1 = existing ? 0 : 1;
  const { error } = await setAnswerVote(supabase, { answerId, userId: user.id, value: next });
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/forum/${questionId}`);
  return { success: true };
}

export async function createReportAction(params: {
  answerId: string;
  questionId: string;
  reasonKey: string;
  details?: string;
}) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;

  const { data: answer } = await supabase
    .from("forum_answers")
    .select("answer_id, user_id, question_id")
    .eq("answer_id", params.answerId)
    .maybeSingle();

  if (!answer || answer.question_id !== params.questionId) {
    return { error: "Comment not found." };
  }
  if (answer.user_id === user.id) {
    return { error: "You can't report your own comment." };
  }

  if (!isReportReasonKey(params.reasonKey)) {
    return { error: "Please choose a report reason." };
  }

  const composed = composeReportReason(params.reasonKey, params.details);
  if (composed.error) return { error: composed.error };

  const { error } = await createReport(supabase, {
    reporterId: user.id,
    reportType: "forum_answer",
    reportedUserId: answer.user_id,
    questionId: params.questionId,
    answerId: params.answerId,
    reason: composed.reason ?? undefined,
  });

  if (error) return { error };
  return { success: true };
}

export async function deleteAnswerAction(answerId: string, questionId: string) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;

  const { data, error } = await deleteAnswer(supabase, { answerId, userId: user.id });
  if (error) return { error: error.message };
  if (!data) return { error: "Could not delete this comment." };

  revalidatePath(`/dashboard/forum/${questionId}`);
  return { success: true };
}

export async function deleteQuestionAction(questionId: string) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;

  const { data, error } = await deleteQuestion(supabase, { questionId, userId: user.id });
  if (error) return { error: error.message };
  if (!data) return { error: "Could not delete this post." };

  revalidatePath("/dashboard/forum");
  if (data.subforum_slug) revalidatePath(forumSubforumPath(data.subforum_slug));
  return { success: true, subforumSlug: data.subforum_slug };
}

export async function createQuestionReportAction(params: {
  questionId: string;
  reasonKey: string;
  details?: string;
}) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;

  const { data: question } = await supabase
    .from("forum_questions")
    .select("question_id, user_id, title")
    .eq("question_id", params.questionId)
    .maybeSingle();

  if (!question) return { error: "Post not found." };
  if (question.user_id === user.id) {
    return { error: "You can't report your own post." };
  }

  if (!isReportReasonKey(params.reasonKey)) {
    return { error: "Please choose a report reason." };
  }

  const composed = composeReportReason(params.reasonKey, params.details);
  if (composed.error) return { error: composed.error };

  const { error } = await createReport(supabase, {
    reporterId: user.id,
    reportType: "forum_question",
    reportedUserId: question.user_id,
    questionId: params.questionId,
    reason: composed.reason ?? undefined,
  });

  if (error) return { error };
  return { success: true };
}
