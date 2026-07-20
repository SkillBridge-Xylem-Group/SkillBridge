import type { SupabaseClient } from "@supabase/supabase-js";
import { getForumSubforum } from "@/lib/forumSubforums";
import { escapePostgrestFilter } from "@/lib/security";

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

export type CommentSort = "best" | "new" | "old";

/** Max nesting depth (0 = root). Replies deeper than this attach to the deepest allowed ancestor. */
export const MAX_COMMENT_DEPTH = 7;

export type ForumAnswer = {
  answer_id: string;
  parent_answer_id: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
  author: { id: string; fullname: string; avatar_url: string | null };
  /** Net score (upvotes − downvotes). */
  score: number;
  /** @deprecated use score */
  vote_count: number;
  myVote: -1 | 0 | 1;
  /** @deprecated use myVote === 1 */
  hasVoted: boolean;
  isOp: boolean;
  depth: number;
  isTopAnswer: boolean;
  children: ForumAnswer[];
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
    const term = escapePostgrestFilter(opts.search.trim());
    if (term) {
      query = query.or(`title.ilike.%${term}%,content.ilike.%${term}%`);
    }
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
      const term = escapePostgrestFilter(opts.search.trim());
      if (term) {
        legacy = legacy.or(`title.ilike.%${term}%,content.ilike.%${term}%`);
      }
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
  currentUserId: string,
  questionAuthorId?: string
): Promise<ForumAnswer[]> {
  const withParent = await supabase
    .from("forum_answers")
    .select(
      "answer_id, parent_answer_id, content, image_url, created_at, user_id, users(fullname, avatar_url), answer_votes(user_id, value)"
    )
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });

  let data = withParent.data;
  let usedParent = !withParent.error;

  // Fallback if parent_answer_id / vote value not migrated yet.
  if (
    withParent.error?.message?.toLowerCase().includes("parent_answer_id") ||
    withParent.error?.message?.toLowerCase().includes("value")
  ) {
    const legacy = await supabase
      .from("forum_answers")
      .select("answer_id, content, image_url, created_at, user_id, users(fullname, avatar_url), answer_votes(user_id)")
      .eq("question_id", questionId)
      .order("created_at", { ascending: true });
    data = legacy.data as typeof data;
    usedParent = false;
  }

  const opId = questionAuthorId;
  const flat: ForumAnswer[] = (data ?? []).map((a) => {
    const votes = (a as { answer_votes?: { user_id: string; value?: number }[] }).answer_votes ?? [];
    const author = unwrapUser(a.users);
    let score = 0;
    let myVote: -1 | 0 | 1 = 0;
    for (const v of votes) {
      const val = typeof v.value === "number" ? (v.value as -1 | 1) : 1;
      score += val;
      if (v.user_id === currentUserId) myVote = val;
    }
    return {
      answer_id: a.answer_id,
      parent_answer_id: usedParent
        ? ((a as { parent_answer_id?: string | null }).parent_answer_id ?? null)
        : null,
      content: a.content,
      image_url: (a as { image_url?: string | null }).image_url ?? null,
      created_at: a.created_at,
      author: { id: a.user_id, fullname: author.fullname, avatar_url: author.avatar_url },
      score,
      vote_count: score,
      myVote,
      hasVoted: myVote === 1,
      isOp: !!opId && a.user_id === opId,
      depth: 0,
      isTopAnswer: false,
      children: [],
    };
  });

  const roots = buildCommentTree(flat);
  markTopRootComment(roots);
  return roots;
}

function buildCommentTree(flat: ForumAnswer[]): ForumAnswer[] {
  const byId = new Map<string, ForumAnswer>();
  for (const row of flat) {
    byId.set(row.answer_id, { ...row, children: [] });
  }

  const roots: ForumAnswer[] = [];
  for (const row of byId.values()) {
    const parentId = row.parent_answer_id;
    if (parentId && byId.has(parentId)) {
      const parent = byId.get(parentId)!;
      row.depth = parent.depth + 1;
      parent.children.push(row);
    } else {
      row.parent_answer_id = null;
      row.depth = 0;
      roots.push(row);
    }
  }

  function assignDepth(node: ForumAnswer, depth: number) {
    node.depth = depth;
    for (const child of node.children) assignDepth(child, depth + 1);
  }
  for (const root of roots) assignDepth(root, 0);

  return roots;
}

function markTopRootComment(roots: ForumAnswer[]) {
  if (roots.length === 0) return;
  const maxScore = Math.max(...roots.map((r) => r.score));
  if (maxScore <= 0) return;
  const top = roots.find((r) => r.score === maxScore);
  if (top) top.isTopAnswer = true;
}

export function sortCommentTree(roots: ForumAnswer[], sort: CommentSort): ForumAnswer[] {
  const compare = (a: ForumAnswer, b: ForumAnswer) => {
    if (sort === "new") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sort === "old") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    // best
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };

  function sortNode(nodes: ForumAnswer[]): ForumAnswer[] {
    return nodes
      .slice()
      .sort(compare)
      .map((n) => ({ ...n, children: sortNode(n.children) }));
  }

  return sortNode(roots);
}

/** Keep ancestors of matching nodes so the tree does not break. */
export function filterCommentTree(roots: ForumAnswer[], query: string): ForumAnswer[] {
  const q = query.trim().toLowerCase();
  if (!q) return roots;

  function filterNode(node: ForumAnswer): ForumAnswer | null {
    const children = node.children.map(filterNode).filter(Boolean) as ForumAnswer[];
    const selfMatch =
      node.content.toLowerCase().includes(q) || node.author.fullname.toLowerCase().includes(q);
    if (!selfMatch && children.length === 0) return null;
    return { ...node, children };
  }

  return roots.map(filterNode).filter(Boolean) as ForumAnswer[];
}

export function countComments(roots: ForumAnswer[]): number {
  let n = 0;
  function walk(nodes: ForumAnswer[]) {
    for (const node of nodes) {
      n += 1;
      walk(node.children);
    }
  }
  walk(roots);
  return n;
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

async function resolveParentAnswerId(
  supabase: SupabaseClient,
  questionId: string,
  parentAnswerId: string | null | undefined
): Promise<{ parentId: string | null; error?: string }> {
  if (!parentAnswerId) return { parentId: null };

  type Row = { answer_id: string; question_id: string; parent_answer_id: string | null };

  const { data: parent } = await supabase
    .from("forum_answers")
    .select("answer_id, question_id, parent_answer_id")
    .eq("answer_id", parentAnswerId)
    .maybeSingle();

  if (!parent || (parent as Row).question_id !== questionId) {
    return { parentId: null, error: "Parent comment not found." };
  }

  // Compute depth of the intended parent (0 = root).
  let depth = 0;
  let walkId: string | null = (parent as Row).parent_answer_id;
  const seen = new Set<string>();
  while (walkId) {
    if (seen.has(walkId)) break;
    seen.add(walkId);
    depth += 1;
    const { data: next } = await supabase
      .from("forum_answers")
      .select("parent_answer_id")
      .eq("answer_id", walkId)
      .maybeSingle();
    walkId = (next as { parent_answer_id?: string | null } | null)?.parent_answer_id ?? null;
  }

  // Child would be depth+1; if that exceeds max, walk up until it fits.
  let attachId = (parent as Row).answer_id;
  let attachDepth = depth;
  while (attachDepth + 1 > MAX_COMMENT_DEPTH) {
    const { data: up } = await supabase
      .from("forum_answers")
      .select("answer_id, parent_answer_id")
      .eq("answer_id", attachId)
      .maybeSingle();
    if (!up?.parent_answer_id) {
      attachId = attachId;
      break;
    }
    attachId = up.parent_answer_id as string;
    attachDepth -= 1;
  }

  return { parentId: attachId };
}

export async function createAnswer(
  supabase: SupabaseClient,
  params: {
    questionId: string;
    userId: string;
    content: string;
    imageUrl?: string | null;
    parentAnswerId?: string | null;
  }
) {
  const resolved = await resolveParentAnswerId(supabase, params.questionId, params.parentAnswerId);
  if (resolved.error) {
    return { data: null, error: { message: resolved.error } };
  }

  const payload: Record<string, unknown> = {
    question_id: params.questionId,
    user_id: params.userId,
    content: params.content,
    image_url: params.imageUrl ?? null,
  };
  if (resolved.parentId) {
    payload.parent_answer_id = resolved.parentId;
  }

  const result = await supabase.from("forum_answers").insert(payload).select("answer_id").single();

  // Fallback if parent column missing
  if (result.error?.message?.toLowerCase().includes("parent_answer_id")) {
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

  return result;
}

export async function setAnswerVote(
  supabase: SupabaseClient,
  params: { answerId: string; userId: string; value: -1 | 0 | 1 }
) {
  const { data: existing } = await supabase
    .from("answer_votes")
    .select("vote_id, value")
    .eq("answer_id", params.answerId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (params.value === 0) {
    if (!existing) return { error: null };
    return supabase.from("answer_votes").delete().eq("vote_id", existing.vote_id);
  }

  if (!existing) {
    const inserted = await supabase
      .from("answer_votes")
      .insert({ answer_id: params.answerId, user_id: params.userId, value: params.value })
      .select("vote_id")
      .single();

    if (inserted.error?.message?.toLowerCase().includes("value")) {
      // Legacy schema: only upvote toggle
      if (params.value === -1) {
        return { error: { message: "Downvotes require a database migration." } };
      }
      return supabase
        .from("answer_votes")
        .insert({ answer_id: params.answerId, user_id: params.userId })
        .select("vote_id")
        .single();
    }
    return inserted;
  }

  const currentVal =
    typeof (existing as { value?: number }).value === "number"
      ? ((existing as { value: number }).value as -1 | 1)
      : 1;

  if (currentVal === params.value) {
    return supabase.from("answer_votes").delete().eq("vote_id", existing.vote_id);
  }

  const updated = await supabase
    .from("answer_votes")
    .update({ value: params.value })
    .eq("vote_id", existing.vote_id);

  if (updated.error?.message?.toLowerCase().includes("value")) {
    // Legacy: switch means delete + maybe re-insert upvote only
    if (params.value === -1) {
      return { error: { message: "Downvotes require a database migration." } };
    }
    await supabase.from("answer_votes").delete().eq("vote_id", existing.vote_id);
    return supabase
      .from("answer_votes")
      .insert({ answer_id: params.answerId, user_id: params.userId })
      .select("vote_id")
      .single();
  }

  return updated;
}

/** @deprecated use setAnswerVote */
export async function toggleAnswerVote(supabase: SupabaseClient, params: { answerId: string; userId: string }) {
  const { data: existing } = await supabase
    .from("answer_votes")
    .select("vote_id")
    .eq("answer_id", params.answerId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (existing) {
    return setAnswerVote(supabase, { ...params, value: 0 });
  }
  return setAnswerVote(supabase, { ...params, value: 1 });
}
