"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateThread } from "@/lib/messages";

export async function startThreadAction(otherUserId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in to message someone." };

  const { threadId, error } = await getOrCreateThread(supabase, user.id, otherUserId);
  if (error || !threadId) return { error: error ?? "Couldn't start a conversation." };

  redirect(`/dashboard/messages/${threadId}`);
}
