"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteForumAnswerAction(answerId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("forum_answers").delete().eq("answer_id", answerId);
  if (error) return { error: error.message };
  return { success: true };
}