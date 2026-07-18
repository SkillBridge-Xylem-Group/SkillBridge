import type { SupabaseClient } from "@supabase/supabase-js";
import { FORUM_SUBFORUMS } from "@/lib/forumSubforums";

export const COMMUNITY_ACCENT_COLORS = [
  { id: "brand", hex: "#2563eb", ring: "ring-blue-600", avatar: "bg-brand text-white" },
  { id: "emerald", hex: "#10b981", ring: "ring-emerald-500", avatar: "bg-emerald-500 text-white" },
  { id: "violet", hex: "#8b5cf6", ring: "ring-violet-500", avatar: "bg-violet-500 text-white" },
  { id: "amber", hex: "#f59e0b", ring: "ring-amber-500", avatar: "bg-amber-500 text-white" },
  { id: "rose", hex: "#f43f5e", ring: "ring-rose-500", avatar: "bg-rose-500 text-white" },
  { id: "sky", hex: "#0ea5e9", ring: "ring-sky-500", avatar: "bg-sky-500 text-white" },
] as const;

export type CommunityAccentColor = (typeof COMMUNITY_ACCENT_COLORS)[number]["id"];

export function isCommunityAccentColor(value: unknown): value is CommunityAccentColor {
  return typeof value === "string" && COMMUNITY_ACCENT_COLORS.some((c) => c.id === value);
}

export function normalizeCommunityAccent(value: unknown): CommunityAccentColor {
  return isCommunityAccentColor(value) ? value : "brand";
}

export function communityAccentHex(accent?: string | null): string {
  const id = normalizeCommunityAccent(accent);
  return COMMUNITY_ACCENT_COLORS.find((c) => c.id === id)?.hex ?? COMMUNITY_ACCENT_COLORS[0].hex;
}

export function communityAccentAvatarClass(accent?: string | null): string {
  const id = normalizeCommunityAccent(accent);
  return COMMUNITY_ACCENT_COLORS.find((c) => c.id === id)?.avatar ?? COMMUNITY_ACCENT_COLORS[0].avatar;
}

/** Persist accent even when DB has no accent_color column (encoded in image_url). */
const ACCENT_IMAGE_PREFIX = "sbicon:";

export function encodeCommunityImageField(
  accent: CommunityAccentColor | string | null | undefined,
  imageUrl: string | null | undefined
): string | null {
  const color = normalizeCommunityAccent(accent);
  const url = imageUrl?.trim() || null;
  if (url) return `${ACCENT_IMAGE_PREFIX}${color}|${url}`;
  if (color === "brand") return null;
  return `${ACCENT_IMAGE_PREFIX}${color}`;
}

export function decodeCommunityImageField(raw: string | null | undefined): {
  accent: CommunityAccentColor;
  imageUrl: string | null;
} {
  if (!raw) return { accent: "brand", imageUrl: null };
  if (raw.startsWith(ACCENT_IMAGE_PREFIX)) {
    const rest = raw.slice(ACCENT_IMAGE_PREFIX.length);
    const pipe = rest.indexOf("|");
    if (pipe === -1) {
      return { accent: normalizeCommunityAccent(rest), imageUrl: null };
    }
    return {
      accent: normalizeCommunityAccent(rest.slice(0, pipe)),
      imageUrl: rest.slice(pipe + 1) || null,
    };
  }
  return { accent: "brand", imageUrl: raw };
}

export type ForumCommunity = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  accent_color: CommunityAccentColor;
  created_by: string | null;
  is_official: boolean;
  created_at: string;
  member_count: number;
  post_count: number;
  joined: boolean;
};

export const COMMUNITY_TOPICS = [
  "Anime & Cosplay",
  "Art",
  "Business & Finance",
  "Collectibles & Hobbies",
  "Education & Career",
  "Fashion & Beauty",
  "Food & Drinks",
  "Games",
  "Health",
  "Home & Garden",
  "Humanities & Law",
  "Identity & Relationships",
  "Internet Culture",
  "Movies & TV",
  "Music",
  "Nature & Outdoors",
  "News & Politics",
  "Places & Travel",
  "Pop Culture",
  "Q&As & Stories",
  "Reading & Writing",
  "Sciences",
  "Sports",
  "Technology",
  "Vehicles",
  "Wellness",
  "Design",
  "Marketing",
  "Soft Skills",
  "General",
] as const;

export type CommunityTopic = (typeof COMMUNITY_TOPICS)[number];

/** Hub filter chips + persisted category values (includes All). */
export const COMMUNITY_CATEGORIES = ["All", ...COMMUNITY_TOPICS] as const;

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];

export function isCommunityTopic(value: unknown): value is CommunityTopic {
  return typeof value === "string" && (COMMUNITY_TOPICS as readonly string[]).includes(value);
}

export function normalizeCommunityCategory(value: unknown): string {
  if (typeof value === "string" && value !== "All" && isCommunityTopic(value)) return value;
  if (typeof value === "string" && value.trim() && value !== "All") return value.trim().slice(0, 64);
  return "General";
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;
const COMMUNITY_SELECT =
  "id, slug, title, description, category, image_url, accent_color, created_by, is_official, created_at, forum_community_members(count)";
const COMMUNITY_SELECT_LEGACY =
  "id, slug, title, description, category, image_url, created_by, is_official, created_at, forum_community_members(count)";

export function normalizeCommunitySlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function isValidCommunitySlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

function fallbackCommunities(): ForumCommunity[] {
  const categoryBySlug: Record<string, string> = {
    general: "General",
    "skill-swaps": "General",
    "learning-help": "Education",
  };
  return FORUM_SUBFORUMS.map((s) => ({
    id: `static-${s.slug}`,
    slug: s.slug,
    title: s.title,
    description: s.description,
    category: categoryBySlug[s.slug] ?? "General",
    image_url: s.image,
    accent_color: "brand" as const,
    created_by: null,
    is_official: true,
    created_at: new Date(0).toISOString(),
    member_count: 0,
    post_count: 0,
    joined: false,
  }));
}

type CommunityRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  accent_color?: string | null;
  created_by: string | null;
  is_official: boolean;
  created_at: string;
  forum_community_members?: { count: number }[];
};

async function loadPostCounts(supabase: SupabaseClient): Promise<Record<string, number>> {
  const { data: postRows } = await supabase.from("forum_questions").select("subforum_slug");
  const postCounts: Record<string, number> = {};
  for (const row of postRows ?? []) {
    const slug = (row as { subforum_slug?: string | null }).subforum_slug ?? "general";
    postCounts[slug] = (postCounts[slug] ?? 0) + 1;
  }
  return postCounts;
}

function toForumCommunity(
  row: CommunityRow,
  postCounts: Record<string, number>,
  joinedIds: Set<string>,
  userId?: string | null
): ForumCommunity {
  const decoded = decodeCommunityImageField(row.image_url);
  const accent_color = isCommunityAccentColor(row.accent_color)
    ? row.accent_color
    : decoded.accent;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    image_url: decoded.imageUrl,
    accent_color,
    created_by: row.created_by,
    is_official: row.is_official,
    created_at: row.created_at,
    member_count: row.forum_community_members?.[0]?.count ?? 0,
    post_count: postCounts[row.slug] ?? 0,
    joined: joinedIds.has(row.id) || (!!userId && row.created_by === userId),
  };
}

export async function listCommunities(
  supabase: SupabaseClient,
  opts: { userId?: string | null; category?: string } = {}
): Promise<ForumCommunity[]> {
  let { data, error } = await supabase
    .from("forum_communities")
    .select(COMMUNITY_SELECT)
    .order("is_official", { ascending: false })
    .order("created_at", { ascending: false });

  if (error?.message?.toLowerCase().includes("accent_color")) {
    ({ data, error } = await supabase
      .from("forum_communities")
      .select(COMMUNITY_SELECT_LEGACY)
      .order("is_official", { ascending: false })
      .order("created_at", { ascending: false }));
  }

  if (error) {
    console.error("listCommunities:", error.message);
    return fallbackCommunities();
  }

  const postCounts = await loadPostCounts(supabase);
  let joinedIds = new Set<string>();
  if (opts.userId) {
    const { data: memberships } = await supabase
      .from("forum_community_members")
      .select("community_id")
      .eq("user_id", opts.userId);
    joinedIds = new Set((memberships ?? []).map((m) => m.community_id));
  }

  let communities = ((data ?? []) as CommunityRow[]).map((row) =>
    toForumCommunity(row, postCounts, joinedIds, opts.userId)
  );

  if (opts.category && opts.category !== "All") {
    communities = communities.filter((c) => c.category === opts.category);
  }

  return communities;
}

export async function getCommunityBySlug(
  supabase: SupabaseClient,
  slug: string,
  userId?: string | null
): Promise<ForumCommunity | null> {
  let { data, error } = await supabase
    .from("forum_communities")
    .select(COMMUNITY_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error?.message?.toLowerCase().includes("accent_color")) {
    ({ data, error } = await supabase
      .from("forum_communities")
      .select(COMMUNITY_SELECT_LEGACY)
      .eq("slug", slug)
      .maybeSingle());
  }

  if (error || !data) {
    const fallback = FORUM_SUBFORUMS.find((s) => s.slug === slug);
    if (!fallback) return null;
    return {
      id: `static-${fallback.slug}`,
      slug: fallback.slug,
      title: fallback.title,
      description: fallback.description,
      category: "General",
      image_url: fallback.image,
      accent_color: "brand",
      created_by: null,
      is_official: true,
      created_at: new Date(0).toISOString(),
      member_count: 0,
      post_count: 0,
      joined: false,
    };
  }

  const row = data as CommunityRow;
  let joined = false;
  if (userId) {
    if (row.created_by === userId) {
      joined = true;
    } else {
      const { data: membership } = await supabase
        .from("forum_community_members")
        .select("community_id")
        .eq("community_id", row.id)
        .eq("user_id", userId)
        .maybeSingle();
      joined = Boolean(membership);
    }
  }

  const { count } = await supabase
    .from("forum_questions")
    .select("question_id", { count: "exact", head: true })
    .eq("subforum_slug", slug);

  const decoded = decodeCommunityImageField(row.image_url);
  const accent_color = isCommunityAccentColor(row.accent_color) ? row.accent_color : decoded.accent;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    image_url: decoded.imageUrl,
    accent_color,
    created_by: row.created_by,
    is_official: row.is_official,
    created_at: row.created_at,
    member_count: row.forum_community_members?.[0]?.count ?? 0,
    post_count: count ?? 0,
    joined,
  };
}

export async function createCommunity(
  supabase: SupabaseClient,
  params: {
    userId: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    imageUrl?: string | null;
    visibility?: "public" | "restricted" | "private";
    accentColor?: CommunityAccentColor | string;
  }
) {
  const slug = normalizeCommunitySlug(params.slug);
  if (!isValidCommunitySlug(slug)) {
    return { data: null, error: { message: "Slug must be 3–50 characters: lowercase letters, numbers, hyphens." } };
  }
  if (!params.title.trim() || params.title.trim().length < 3) {
    return { data: null, error: { message: "Community name must be at least 3 characters." } };
  }
  if (params.title.trim().length > 21) {
    return { data: null, error: { message: "Community name must be 21 characters or fewer." } };
  }
  if (!params.description.trim()) {
    return { data: null, error: { message: "Description is required." } };
  }

  const category = normalizeCommunityCategory(params.category);

  const visibility =
    params.visibility === "restricted" || params.visibility === "private" ? params.visibility : "public";
  const accent_color = normalizeCommunityAccent(params.accentColor);
  // Always encode accent into image_url so color works even without accent_color column.
  const image_url = encodeCommunityImageField(accent_color, params.imageUrl ?? null);

  const insertPayload: Record<string, unknown> = {
    slug,
    title: params.title.trim(),
    description: params.description.trim().slice(0, 300),
    category,
    image_url,
    created_by: params.userId,
    is_official: false,
    visibility,
    accent_color,
  };

  let { data, error } = await supabase
    .from("forum_communities")
    .insert(insertPayload)
    .select("id, slug")
    .single();

  if (error?.message?.toLowerCase().includes("visibility")) {
    delete insertPayload.visibility;
    ({ data, error } = await supabase
      .from("forum_communities")
      .insert(insertPayload)
      .select("id, slug")
      .single());
  }

  if (error?.message?.toLowerCase().includes("accent_color")) {
    delete insertPayload.accent_color;
    ({ data, error } = await supabase
      .from("forum_communities")
      .insert(insertPayload)
      .select("id, slug")
      .single());
  }

  if (error) return { data: null, error };

  await supabase.from("forum_community_members").insert({
    community_id: data.id,
    user_id: params.userId,
  });

  return { data, error: null };
}

export async function joinCommunity(supabase: SupabaseClient, communityId: string, userId: string) {
  return supabase.from("forum_community_members").insert({ community_id: communityId, user_id: userId });
}

export async function updateCommunityImage(
  supabase: SupabaseClient,
  params: {
    communityId: string;
    userId: string;
    imageUrl: string | null;
    accentColor?: CommunityAccentColor | string | null;
  }
) {
  const { data: existing } = await supabase
    .from("forum_communities")
    .select("image_url, accent_color")
    .eq("id", params.communityId)
    .eq("created_by", params.userId)
    .maybeSingle();

  if (!existing) {
    return { data: null, error: { message: "Only the community creator can change the icon." } };
  }

  const decoded = decodeCommunityImageField(existing.image_url);
  const accent = normalizeCommunityAccent(
    params.accentColor ??
      (isCommunityAccentColor(existing.accent_color) ? existing.accent_color : decoded.accent)
  );
  const image_url = encodeCommunityImageField(accent, params.imageUrl);

  const updatePayload: Record<string, unknown> = { image_url, accent_color: accent };

  let result = await supabase
    .from("forum_communities")
    .update(updatePayload)
    .eq("id", params.communityId)
    .eq("created_by", params.userId)
    .select("id, slug")
    .maybeSingle();

  if (result.error?.message?.toLowerCase().includes("accent_color")) {
    delete updatePayload.accent_color;
    result = await supabase
      .from("forum_communities")
      .update(updatePayload)
      .eq("id", params.communityId)
      .eq("created_by", params.userId)
      .select("id, slug")
      .maybeSingle();
  }

  return result;
}

export async function updateCommunityAccent(
  supabase: SupabaseClient,
  params: { communityId: string; userId: string; accentColor: CommunityAccentColor | string }
) {
  const { data: existing } = await supabase
    .from("forum_communities")
    .select("image_url, accent_color")
    .eq("id", params.communityId)
    .eq("created_by", params.userId)
    .maybeSingle();

  if (!existing) {
    return { data: null, error: { message: "Only the community creator can change the color." } };
  }

  const decoded = decodeCommunityImageField(existing.image_url);
  const accent = normalizeCommunityAccent(params.accentColor);
  const image_url = encodeCommunityImageField(accent, decoded.imageUrl);
  const updatePayload: Record<string, unknown> = { image_url, accent_color: accent };

  let result = await supabase
    .from("forum_communities")
    .update(updatePayload)
    .eq("id", params.communityId)
    .eq("created_by", params.userId)
    .select("id, slug")
    .maybeSingle();

  if (result.error?.message?.toLowerCase().includes("accent_color")) {
    delete updatePayload.accent_color;
    result = await supabase
      .from("forum_communities")
      .update(updatePayload)
      .eq("id", params.communityId)
      .eq("created_by", params.userId)
      .select("id, slug")
      .maybeSingle();
  }

  return result;
}

export async function leaveCommunity(supabase: SupabaseClient, communityId: string, userId: string) {
  return supabase
    .from("forum_community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", userId);
}

/** Communities for the left nav: owned first, then joined. */
export type SidebarCommunity = {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  accent_color: CommunityAccentColor;
  isOwner: boolean;
};

export async function listUserSidebarCommunities(
  supabase: SupabaseClient,
  userId: string
): Promise<SidebarCommunity[]> {
  const selectWithAccent = "id, slug, title, image_url, accent_color, created_by";
  const selectLegacy = "id, slug, title, image_url, created_by";

  let ownedQuery = await supabase
    .from("forum_communities")
    .select(selectWithAccent)
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (ownedQuery.error?.message?.toLowerCase().includes("accent_color")) {
    ownedQuery = await supabase
      .from("forum_communities")
      .select(selectLegacy)
      .eq("created_by", userId)
      .order("created_at", { ascending: false });
  }

  const [{ data: owned, error: ownedError }, { data: memberships, error: memberError }] =
    await Promise.all([
      Promise.resolve(ownedQuery),
      supabase.from("forum_community_members").select("community_id").eq("user_id", userId),
    ]);

  if (ownedError && memberError) {
    console.error("listUserSidebarCommunities:", ownedError.message, memberError?.message);
    return [];
  }

  const byId = new Map<string, SidebarCommunity>();

  for (const row of owned ?? []) {
    const decoded = decodeCommunityImageField(row.image_url);
    const accent = isCommunityAccentColor((row as { accent_color?: string }).accent_color)
      ? (row as { accent_color: CommunityAccentColor }).accent_color
      : decoded.accent;
    byId.set(row.id, {
      id: row.id,
      slug: row.slug,
      title: row.title,
      image_url: decoded.imageUrl,
      accent_color: accent,
      isOwner: true,
    });
  }

  const joinedIds = (memberships ?? [])
    .map((m) => m.community_id)
    .filter((id) => id && !byId.has(id));

  if (joinedIds.length > 0) {
    let joinedQuery = await supabase
      .from("forum_communities")
      .select(selectWithAccent)
      .in("id", joinedIds)
      .order("title", { ascending: true });

    if (joinedQuery.error?.message?.toLowerCase().includes("accent_color")) {
      joinedQuery = await supabase
        .from("forum_communities")
        .select(selectLegacy)
        .in("id", joinedIds)
        .order("title", { ascending: true });
    }

    for (const row of joinedQuery.data ?? []) {
      const decoded = decodeCommunityImageField(row.image_url);
      const accent = isCommunityAccentColor((row as { accent_color?: string }).accent_color)
        ? (row as { accent_color: CommunityAccentColor }).accent_color
        : decoded.accent;
      byId.set(row.id, {
        id: row.id,
        slug: row.slug,
        title: row.title,
        image_url: decoded.imageUrl,
        accent_color: accent,
        isOwner: row.created_by === userId,
      });
    }
  }

  const list = [...byId.values()];
  list.sort((a, b) => {
    if (a.isOwner !== b.isOwner) return a.isOwner ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
  return list;
}

/** Slugs valid for posting: DB communities, else static catalog. */
export async function isKnownCommunitySlug(supabase: SupabaseClient, slug: string): Promise<boolean> {
  if (!isValidCommunitySlug(slug) && !FORUM_SUBFORUMS.some((s) => s.slug === slug)) return false;
  const { data } = await supabase.from("forum_communities").select("slug").eq("slug", slug).maybeSingle();
  if (data) return true;
  return FORUM_SUBFORUMS.some((s) => s.slug === slug);
}
