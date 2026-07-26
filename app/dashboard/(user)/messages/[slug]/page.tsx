import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateThread, getUserBySlug, getThreadMessages } from "@/lib/messages";
import { markThreadMessageNotificationsRead } from "@/lib/notifications";
import ChatPane from "@/components/messages/ChatPane";

export default async function ThreadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const partner = await getUserBySlug(supabase, slug);
  if (!partner || partner.id === user.id) {
    notFound();
  }

  const { threadId, error } = await getOrCreateThread(supabase, user.id, partner.id);
  if (error || !threadId) {
    notFound();
  }

  await markThreadMessageNotificationsRead(supabase, user.id, threadId);
  const messages = await getThreadMessages(supabase, threadId);

  return <ChatPane threadId={threadId} viewerId={user.id} partner={partner} initialMessages={messages} />;
}
