import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { getSafeForumImageUrl } from "@/lib/forumImageUrl";
import { getForumSubforum } from "@/lib/forumSubforums";

export async function GET() {
  const { supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const primary = await supabase
    .from("forum_questions")
    .select(
      "question_id, title, created_at, user_id, image_url, subforum_slug, users(fullname, avatar_url), forum_answers(count)"
    )
    .order("created_at", { ascending: false })
    .limit(5);

  let questions = primary.data;
  let error = primary.error;

  if (error?.message?.toLowerCase().includes("subforum_slug")) {
    const legacy = await supabase
      .from("forum_questions")
      .select("question_id, title, created_at, user_id, image_url, users(fullname, avatar_url), forum_answers(count)")
      .order("created_at", { ascending: false })
      .limit(5);
    questions = (legacy.data ?? []).map((q) => ({ ...q, subforum_slug: "general" }));
    error = legacy.error;
  }

  if (error) {
    console.error("Failed to fetch recent forum questions:", error);
    return NextResponse.json({ error: "Failed to fetch recent forum questions" }, { status: 500 });
  }

  const mapped = (questions ?? []).map((q) => {
    const slug = getForumSubforum((q as { subforum_slug?: string | null }).subforum_slug).slug;
    const sub = getForumSubforum(slug);
    return {
      id: q.question_id,
      title: q.title,
      created_at: q.created_at,
      author_id: q.user_id,
      author_name: (Array.isArray(q.users) ? q.users[0] : q.users)?.fullname ?? "Unknown",
      author_avatar_url: (Array.isArray(q.users) ? q.users[0] : q.users)?.avatar_url ?? null,
      reply_count: q.forum_answers?.[0]?.count ?? 0,
      image_url: getSafeForumImageUrl(q.image_url),
      subforum_slug: sub.slug,
      subforum_title: sub.title,
    };
  });

  return NextResponse.json({ questions: mapped });
}
