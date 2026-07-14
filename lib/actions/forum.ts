"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createQuestion, createAnswer, toggleAnswerVote } from "@/lib/forum";

export async function createQuestionAction(title: string, content: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to post." };
  if (!title.trim() || !content.trim()) return { error: "Title and content can't be empty." };

  const { data, error } = await createQuestion(supabase, { userId: user.id, title: title.trim(), content: content.trim() });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/forum");
  return { success: true, questionId: data?.question_id };
}

export async function createAnswerAction(questionId: string, content: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to reply." };
  if (!content.trim()) return { error: "Reply can't be empty." };

  const { error } = await createAnswer(supabase, { questionId, userId: user.id, content: content.trim() });
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/forum/${questionId}`);
  return { success: true };
}

export async function toggleVoteAction(answerId: string, questionId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to vote." };

  const { error } = await toggleAnswerVote(supabase, { answerId, userId: user.id });
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/forum/${questionId}`);
  return { success: true };
}