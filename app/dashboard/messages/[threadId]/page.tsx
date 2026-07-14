import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getThreadParticipant, getThreadMessages } from "@/lib/messages";
import { markThreadMessageNotificationsRead } from "@/lib/notifications";
import ChatPane from "@/components/messages/ChatPane";

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const partner = await getThreadParticipant(supabase, threadId, user.id);
  if (!partner) {
    notFound();
  }

  await markThreadMessageNotificationsRead(supabase, user.id, threadId);
  const messages = await getThreadMessages(supabase, threadId);

  return <ChatPane threadId={threadId} viewerId={user.id} partner={partner} initialMessages={messages} />;
}
