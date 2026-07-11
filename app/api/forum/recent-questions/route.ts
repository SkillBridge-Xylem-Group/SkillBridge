import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: questions, error } = await supabase
    .from("forum_questions")
    .select(
      "question_id, title, created_at, user_id, users(fullname), forum_answers(count)"
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Failed to fetch recent forum questions:", error);
    return NextResponse.json({ error: "Failed to fetch recent forum questions" }, { status: 500 });
  }

  // Note: questions have no upvote concept in the BRD (FR-007/FR-008 —
  // only answers are voted on, via answer_votes), so no upvotes field here.
  const mapped = (questions ?? []).map((q) => ({
    id: q.question_id,
    title: q.title,
    created_at: q.created_at,
    author_id: q.user_id,
    author_name: q.users?.fullname ?? "Unknown",
    reply_count: q.forum_answers?.[0]?.count ?? 0,
  }));

  return NextResponse.json({ questions: mapped });
}
