import type { SupabaseClient } from "@supabase/supabase-js";
import { getForumSubforum } from "@/lib/forumSubforums";

export type ForumQuestionSummary = {
  question_id: string;
  title: string;
  content: string;
  image_url: string | null;
  subforum_slug: string;
  created_at: string;
  author: { id: string; fullname: string; avatar_url: string | null };
  answer_count: number;
};

export type ForumAnswer = {
  answer_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author: { id: string; fullname: string; avatar_url: string | null };
  vote_count: number;
  hasVoted: boolean;
  isTopAnswer: boolean;
};

export type ForumQuestionDetail = {
  question_id: string;
  title: string;
  content: string;
  image_url: string | null;
  subforum_slug: string;
  created_at: string;
  author: { id: string; fullname: string; avatar_url: string | null };
};

function unwrapUser(u: unknown): { fullname: string; avatar_url: string | null } {
  const row = (Array.isArray(u) ? u[0] : u) as
    | { fullname?: string; avatar_url?: string | null }
    | null
    | undefined;
  return {
    fullname: row?.fullname ?? "Unknown",
    avatar_url: row?.avatar_url ?? null,
  };
}

function normalizeSlug(raw: unknown): string {
  return getForumSubforum(typeof raw === "string" ? raw : null).slug;
}

export async function getForumQuestions(
  supabase: SupabaseClient,
  opts: {
    search?: string;
    tab?: "latest" | "popular" | "unanswered";
    limit?: number;
    subforumSlug?: string;
  } = {}
): Promise<ForumQuestionSummary[]> {
  let query = supabase
    .from("forum_questions")
    .select(
      "question_id, title, content, image_url, subforum_slug, created_at, user_id, users(fullname, avatar_url), forum_answers(count)"
    )
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 100);

  if (opts.subforumSlug?.trim()) {
    query = query.eq("subforum_slug", opts.subforumSlug.trim());
  }

  if (opts.search?.trim()) {
    const term = opts.search.trim();
    query = query.or(`title.ilike.%${term}%,content.ilike.%${term}%`);
  }

  const { data, error } = await query;

  // Fallback if column not migrated yet — keep forum usable.
  if (error?.message?.toLowerCase().includes("subforum_slug")) {
    let legacy = supabase
      .from("forum_questions")
      .select("question_id, title, content, image_url, created_at, user_id, users(fullname, avatar_url), forum_answers(count)")
      .order("created_at", { ascending: false })
      .limit(opts.limit ?? 100);
    if (opts.search?.trim()) {
      const term = opts.search.trim();
      legacy = legacy.or(`title.ilike.%${term}%,content.ilike.%${term}%`);
    }
    const legacyRes = await legacy;
    let results: ForumQuestionSummary[] = (legacyRes.data ?? []).map((q) => ({
      question_id: q.question_id,
      title: q.title,
      content: q.content,
      image_url: (q as { image_url?: string | null }).image_url ?? null,
      subforum_slug: "general",
      created_at: q.created_at,
      author: {
        id: q.user_id,
        fullname: unwrapUser(q.users).fullname,
        avatar_url: unwrapUser(q.users).avatar_url,
      },
      answer_count: (q as { forum_answers?: { count: number }[] }).forum_answers?.[0]?.count ?? 0,
    }));
    if (opts.subforumSlug && opts.subforumSlug !== "general") results = [];
    if (opts.tab === "unanswered") results = results.filter((r) => r.answer_count === 0);
    else if (opts.tab === "popular") results = results.slice().sort((a, b) => b.answer_count - a.answer_count);
    return results;
  }

  let results: ForumQuestionSummary[] = (data ?? []).map((q) => ({
    question_id: q.question_id,
    title: q.title,
    content: q.content,
    image_url: (q as { image_url?: string | null }).image_url ?? null,
    subforum_slug: normalizeSlug((q as { subforum_slug?: string | null }).subforum_slug),
    created_at: q.created_at,
    author: {
      id: q.user_id,
      fullname: unwrapUser(q.users).fullname,
      avatar_url: unwrapUser(q.users).avatar_url,
    },
    answer_count: (q as { forum_answers?: { count: number }[] }).forum_answers?.[0]?.count ?? 0,
  }));

  if (opts.tab === "unanswered") {
    results = results.filter((r) => r.answer_count === 0);
  } else if (opts.tab === "popular") {
    results = results.slice().sort((a, b) => b.answer_count - a.answer_count);
  }

  return results;
}

/** Post counts keyed by subforum slug (missing slugs → 0). */
export async function getSubforumStats(supabase: SupabaseClient): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("forum_questions").select("subforum_slug");

  if (error?.message?.toLowerCase().includes("subforum_slug")) {
    const legacy = await supabase.from("forum_questions").select("question_id");
    const count = legacy.data?.length ?? 0;
    return { general: count };
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const slug = normalizeSlug((row as { subforum_slug?: string | null }).subforum_slug);
    counts[slug] = (counts[slug] ?? 0) + 1;
  }
  return counts;
}

export async function getQuestionDetail(
  supabase: SupabaseClient,
  questionId: string
): Promise<ForumQuestionDetail | null> {
  const { data, error } = await supabase
    .from("forum_questions")
    .select("question_id, title, content, image_url, subforum_slug, created_at, user_id, users(fullname, avatar_url)")
    .eq("question_id", questionId)
    .maybeSingle();

  if (error?.message?.toLowerCase().includes("subforum_slug")) {
    const legacy = await supabase
      .from("forum_questions")
      .select("question_id, title, content, image_url, created_at, user_id, users(fullname, avatar_url)")
      .eq("question_id", questionId)
      .maybeSingle();
    if (!legacy.data) return null;
    const author = unwrapUser(legacy.data.users);
    return {
      question_id: legacy.data.question_id,
      title: legacy.data.title,
      content: legacy.data.content,
      image_url: (legacy.data as { image_url?: string | null }).image_url ?? null,
      subforum_slug: "general",
      created_at: legacy.data.created_at,
      author: { id: legacy.data.user_id, fullname: author.fullname, avatar_url: author.avatar_url },
    };
  }

  if (!data) return null;

  const author = unwrapUser(data.users);
  return {
    question_id: data.question_id,
    title: data.title,
    content: data.content,
    image_url: (data as { image_url?: string | null }).image_url ?? null,
    subforum_slug: normalizeSlug((data as { subforum_slug?: string | null }).subforum_slug),
    created_at: data.created_at,
    author: { id: data.user_id, fullname: author.fullname, avatar_url: author.avatar_url },
  };
}

export async function getAnswers(
  supabase: SupabaseClient,
  questionId: string,
  currentUserId: string
): Promise<ForumAnswer[]> {
  const { data } = await supabase
    .from("forum_answers")
    .select("answer_id, content, image_url, created_at, user_id, users(fullname, avatar_url), answer_votes(user_id)")
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });

  const rows = (data ?? []).map((a) => {
    const votes = (a as { answer_votes?: { user_id: string }[] }).answer_votes ?? [];
    const author = unwrapUser(a.users);
    return {
      answer_id: a.answer_id,
      content: a.content,
      image_url: (a as { image_url?: string | null }).image_url ?? null,
      created_at: a.created_at,
      author: { id: a.user_id, fullname: author.fullname, avatar_url: author.avatar_url },
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
  params: {
    userId: string;
    title: string;
    content: string;
    imageUrl?: string | null;
    subforumSlug: string;
  }
) {
  const slug = params.subforumSlug.trim() || "general";

  const withSlug = await supabase
    .from("forum_questions")
    .insert({
      user_id: params.userId,
      title: params.title,
      content: params.content,
      image_url: params.imageUrl ?? null,
      subforum_slug: slug,
    })
    .select("question_id")
    .single();

  if (withSlug.error?.message?.toLowerCase().includes("subforum_slug")) {
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

  return withSlug;
}

export async function createAnswer(
  supabase: SupabaseClient,
  params: { questionId: string; userId: string; content: string; imageUrl?: string | null }
) {
  return supabase
    .from("forum_answers")
    .insert({
      question_id: params.questionId,
      user_id: params.userId,
      content: params.content,
      image_url: params.imageUrl ?? null,
    })
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
