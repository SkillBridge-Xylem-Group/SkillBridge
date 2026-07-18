export type ForumSubforum = {
  slug: string;
  title: string;
  description: string;
  /** Path under /public, e.g. /images/categories/fullstack.jpg */
  image: string | null;
};

/**
 * Built-in communities only — keep few and product-relevant.
 * Specialty topics should be user-created communities.
 */
export const FORUM_SUBFORUMS: ForumSubforum[] = [
  {
    slug: "general",
    title: "General",
    description: "Everyday discussion about SkillBridge, learning, and anything that doesn’t need its own community yet",
    image: null,
  },
  {
    slug: "skill-swaps",
    title: "Skill Swaps",
    description: "Find swap partners, share session tips, and talk through what worked (or didn’t)",
    image: null,
  },
  {
    slug: "learning-help",
    title: "Learning Help",
    description: "Ask questions, unblock yourself, and help others get unstuck",
    image: null,
  },
];

const BY_SLUG = new Map(FORUM_SUBFORUMS.map((s) => [s.slug, s]));

export function isForumSubforumSlug(value: unknown): value is string {
  return typeof value === "string" && BY_SLUG.has(value);
}

export function getForumSubforum(slug: string | null | undefined): ForumSubforum {
  if (slug && BY_SLUG.has(slug)) return BY_SLUG.get(slug)!;
  if (slug && slug.trim()) {
    return {
      slug: slug.trim(),
      title: slug.trim(),
      description: "",
      image: null,
    };
  }
  return BY_SLUG.get("general")!;
}

export function forumSubforumPath(slug: string): string {
  const s = slug?.trim() || "general";
  return `/dashboard/forum/c/${s}`;
}
