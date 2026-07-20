import { type NextRequest, NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ threadId: string; messageId: string }> }
) {
  const { threadId, messageId } = await params;
  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("message_id", messageId)
    .eq("thread_id", threadId)
    .eq("sender_id", user.id);

  if (error) {
    console.error("Failed to delete message:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
