"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireActiveServerUser } from "@/lib/auth/requireActiveServerUser";
import { getOrCreateThread, getThreadParticipant, deleteThread } from "@/lib/messages";

export async function startThreadAction(otherUserId: string) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;

  const { threadId, error } = await getOrCreateThread(supabase, user.id, otherUserId);
  if (error || !threadId) return { error: error ?? "Couldn't start a conversation." };

  const { data: partnerRow } = await supabase.from("users").select("slug").eq("id", otherUserId).maybeSingle();
  redirect(`/dashboard/messages/${partnerRow?.slug ?? otherUserId}`);
}

export async function deleteThreadAction(threadId: string) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;

  const partner = await getThreadParticipant(supabase, threadId, user.id);
  if (!partner) return { error: "You can't delete this conversation." };

  const { error } = await deleteThread(supabase, threadId);
  if (error) return { error };

  revalidatePath("/dashboard/messages");
  redirect("/dashboard/messages");
}
