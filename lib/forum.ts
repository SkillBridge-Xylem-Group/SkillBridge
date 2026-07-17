import type { SupabaseClient } from "@supabase/supabase-js";

export type ForumQuestionSummary = {
  question_id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author: { id: string; fullname: string };
  answer_count: number;
};

export type ForumAnswer = {
  answer_id: string;
  content: string;
  created_at: string;
  author: { id: string; fullname: string };
  vote_count: number;
  hasVoted: boolean;
  isTopAnswer: boolean;
};

export type ForumQuestionDetail = {
  question_id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author: { id: string; fullname: string };
};

function unwrapUser(u: unknown): { fullname: string } {
  if (Array.isArray(u)) return (u[0] as { fullname: string }) ?? { fullname: "Unknown" };
  return (u as { fullname: string }) ?? { fullname: "Unknown" };
}

export async function getForumQuestions(
  supabase: SupabaseClient,
  opts: { search?: string; tab?: "latest" | "popular" | "unanswered"; limit?: number } = {}
): Promise<ForumQuestionSummary[]> {
  let query = supabase
    .from("forum_questions")
    .select("question_id, title, content, image_url, created_at, user_id, users(fullname), forum_answers(count)")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 100);

  if (opts.search?.trim()) {
    const term = opts.search.trim();
    query = query.or(`title.ilike.%${term}%,content.ilike.%${term}%`);
  }

  const { data } = await query;

  let results: ForumQuestionSummary[] = (data ?? []).map((q) => ({
    question_id: q.question_id,
    title: q.title,
    content: q.content,
    image_url: (q as { image_url?: string | null }).image_url ?? null,
    created_at: q.created_at,
    author: { id: q.user_id, fullname: unwrapUser(q.users).fullname },
    answer_count: (q as { forum_answers?: { count: number }[] }).forum_answers?.[0]?.count ?? 0,
  }));

  if (opts.tab === "unanswered") {
    results = results.filter((r) => r.answer_count === 0);
  } else if (opts.tab === "popular") {
    results = results.slice().sort((a, b) => b.answer_count - a.answer_count);
  }

  return results;
}

export async function getQuestionDetail(supabase: SupabaseClient, questionId: string): Promise<ForumQuestionDetail | null> {
  const { data } = await supabase
    .from("forum_questions")
    .select("question_id, title, content, image_url, created_at, user_id, users(fullname)")
    .eq("question_id", questionId)
    .maybeSingle();

  if (!data) return null;

  return {
    question_id: data.question_id,
    title: data.title,
    content: data.content,
    image_url: (data as { image_url?: string | null }).image_url ?? null,
    created_at: data.created_at,
    author: { id: data.user_id, fullname: unwrapUser(data.users).fullname },
  };
}

export async function getAnswers(supabase: SupabaseClient, questionId: string, currentUserId: string): Promise<ForumAnswer[]> {
  const { data } = await supabase
    .from("forum_answers")
    .select("answer_id, content, created_at, user_id, users(fullname), answer_votes(user_id)")
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });

  const rows = (data ?? []).map((a) => {
    const votes = (a as { answer_votes?: { user_id: string }[] }).answer_votes ?? [];
    return {
      answer_id: a.answer_id,
      content: a.content,
      created_at: a.created_at,
      author: { id: a.user_id, fullname: unwrapUser(a.users).fullname },
      vote_count: votes.length,
      hasVoted: votes.some((v) => v.user_id === currentUserId),
      isTopAnswer: false,
    };
  });

  const maxVotes = Math.max(0, ...rows.map((r) => r.vote_count));
  if (maxVotes > 0) {
    const topIndex = rows.findIndex((r) => r.vote_count === maxVotes);
    if (topIndex !== -1) rows[topIndex].isTopAnswer = true;
  }

  return rows;
}

export async function createQuestion(
  supabase: SupabaseClient,
  params: { userId: string; title: string; content: string; imageUrl?: string | null }
) {
  return supabase
    .from("forum_questions")
    .insert({
      user_id: params.userId,
      title: params.title,
      content: params.content,
      image_url: params.imageUrl ?? null,
    })
    .select("question_id")
    .single();
}

export async function createAnswer(supabase: SupabaseClient, params: { questionId: string; userId: string; content: string }) {
  return supabase
    .from("forum_answers")
    .insert({ question_id: params.questionId, user_id: params.userId, content: params.content })
    .select("answer_id")
    .single();
}

export async function toggleAnswerVote(supabase: SupabaseClient, params: { answerId: string; userId: string }) {
  const { data: existing } = await supabase
    .from("answer_votes")
    .select("vote_id")
    .eq("answer_id", params.answerId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (existing) {
    return supabase.from("answer_votes").delete().eq("vote_id", existing.vote_id);
  }
  return supabase.from("answer_votes").insert({ answer_id: params.answerId, user_id: params.userId });
}