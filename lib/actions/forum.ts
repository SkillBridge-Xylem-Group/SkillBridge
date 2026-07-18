"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createQuestion, createAnswer, toggleAnswerVote } from "@/lib/forum";
import { createNotification } from "@/lib/notifications";
import { getSafeForumImageUrl } from "@/lib/forumImageUrl";
import { forumSubforumPath } from "@/lib/forumSubforums";
import {
  createCommunity,
  isKnownCommunitySlug,
  joinCommunity,
  leaveCommunity,
  updateCommunityAccent,
  updateCommunityImage,
} from "@/lib/forumCommunities";

export async function createQuestionAction(
  title: string,
  content: string,
  imageUrl?: string | null,
  subforumSlug?: string | null
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to post." };
  if (!title.trim()) return { error: "Title can't be empty." };
  if (!content.trim() && !imageUrl?.trim()) {
    return { error: "Add some details or an image before posting." };
  }
  if (!subforumSlug || !(await isKnownCommunitySlug(supabase, subforumSlug))) {
    return { error: "Choose a community to post in." };
  }

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
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const safeImageUrl = getSafeForumImageUrl(input.imageUrl);
  if (input.imageUrl?.trim() && !safeImageUrl) {
    return { error: "Invalid community icon image." };
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
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };
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

export async function updateCommunityAccentAction(communityId: string, accentColor: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };
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
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

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

  const result = currentlyJoined
    ? await leaveCommunity(supabase, resolvedId, user.id)
    : await joinCommunity(supabase, resolvedId, user.id);

  if (result.error) return { error: result.error.message };

  revalidatePath("/dashboard/forum");
  revalidatePath("/dashboard", "layout");
  return { success: true, joined: !currentlyJoined };
}

export async function createAnswerAction(questionId: string, content: string, imageUrl?: string | null) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to reply." };
  if (!content.trim() && !imageUrl?.trim()) {
    return { error: "Add a comment or an image before posting." };
  }

  const safeImageUrl = getSafeForumImageUrl(imageUrl);

  if (imageUrl?.trim() && !safeImageUrl) {
    return { error: "Invalid image URL." };
  }

  const { data: question } = await supabase
    .from("forum_questions")
    .select("user_id, title")
    .eq("question_id", questionId)
    .maybeSingle();

  const { error } = await createAnswer(supabase, {
    questionId,
    userId: user.id,
    content: content.trim(),
    imageUrl: safeImageUrl,
  });
  if (error) return { error: error.message };

  if (question && question.user_id !== user.id) {
    const { data: authorRow } = await supabase.from("users").select("fullname").eq("id", user.id).maybeSingle();
    await createNotification(supabase, {
      userId: question.user_id,
      type: "forum_reply",
      message: `${authorRow?.fullname ?? "Someone"} replied to "${question.title.slice(0, 60)}"`,
      relatedEntityType: "forum_question",
      relatedEntityId: questionId,
    });
  }

  revalidatePath(`/dashboard/forum/${questionId}`);
  return { success: true };
}

export async function toggleVoteAction(answerId: string, questionId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to vote." };

  const { error } = await toggleAnswerVote(supabase, { answerId, userId: user.id });
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/forum/${questionId}`);
  return { success: true };
}
