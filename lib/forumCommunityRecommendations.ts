import type { ForumCommunity } from "@/lib/forumCommunities";

export type WantedSkillRef = {
  skill_id: number;
  skill_name: string;
  category: string;
};

/** Skill catalog categories → related forum community topics. */
const SKILL_CATEGORY_TO_COMMUNITY_TOPICS: Record<string, string[]> = {
  Technology: ["Technology", "Sciences", "Internet Culture", "Games & Media"],
  Design: ["Design", "Art", "Fashion & Beauty"],
  Art: ["Art", "Design", "Collectibles & Hobbies"],
  Business: ["Business", "Business & Finance", "Soft Skills", "Education & Career"],
  Marketing: ["Marketing", "Business", "Internet Culture"],
  "Soft Skills": ["Soft Skills", "Education & Career", "Q&As & Stories", "Education"],
  Languages: ["Languages", "Places & Travel", "Education", "Humanities & Law"],
  Music: ["Music", "Pop Culture"],
  Fitness: ["Fitness", "Sports", "Wellness", "Health"],
  "Food & Lifestyle": ["Food & Lifestyle", "Home & Garden", "Fashion & Beauty", "Places & Travel"],
  Education: ["Education", "Reading & Writing", "Sciences", "Education & Career"],
  "Games & Media": ["Games & Media", "Movies & TV", "Internet Culture", "Anime & Cosplay"],
};

const EXTRA_SKILL_KEYWORDS: Record<string, string[]> = {
  language: ["Languages", "Education"],
  fitness: ["Fitness", "Sports", "Wellness", "Health"],
  wellness: ["Wellness", "Health", "Fitness"],
  yoga: ["Fitness", "Wellness"],
  writing: ["Reading & Writing", "Education"],
  cooking: ["Food & Lifestyle"],
  game: ["Games & Media"],
  music: ["Music"],
  art: ["Art", "Design"],
  design: ["Design", "Art"],
  business: ["Business", "Business & Finance"],
  finance: ["Business & Finance", "Business"],
  tech: ["Technology", "Sciences"],
  photo: ["Art", "Design", "Movies & TV"],
  travel: ["Places & Travel", "Languages"],
  career: ["Education & Career", "Soft Skills"],
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function significantTokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length >= 3);
}

function haystack(community: ForumCommunity): string {
  return normalize(`${community.title} ${community.description} ${community.category}`);
}

/**
 * Score how relevant a community is to the user's wanted skills (higher = better match).
 */
export function scoreCommunityForWantedSkills(
  community: ForumCommunity,
  wantedSkills: WantedSkillRef[]
): number {
  if (wantedSkills.length === 0) return 0;

  let score = 0;
  const text = haystack(community);

  for (const skill of wantedSkills) {
    const skillNorm = normalize(skill.skill_name);
    const skillTokens = significantTokens(skill.skill_name);

    // Direct skill name in title (strongest signal)
    if (normalize(community.title).includes(skillNorm)) {
      score += 24;
    } else if (text.includes(skillNorm)) {
      score += 14;
    } else {
      for (const token of skillTokens) {
        if (token.length >= 4 && text.includes(token)) {
          score += 6;
        }
      }
    }

    // Skill category ↔ community topic mapping
    const topicHints = SKILL_CATEGORY_TO_COMMUNITY_TOPICS[skill.category] ?? [];
    if (community.category === skill.category) {
      score += 18;
    } else if (topicHints.includes(community.category)) {
      score += 12;
    }

    for (const [keyword, topics] of Object.entries(EXTRA_SKILL_KEYWORDS)) {
      if (skillNorm.includes(keyword) && topics.includes(community.category)) {
        score += 8;
      }
    }
  }

  return score;
}

function activityScore(community: ForumCommunity): number {
  return community.post_count * 2 + community.member_count;
}

/**
 * Rank communities for "Recommended for you" using wanted skills, then activity.
 */
export function rankCommunitiesByWantedSkills(
  communities: ForumCommunity[],
  wantedSkills: WantedSkillRef[]
): ForumCommunity[] {
  if (wantedSkills.length === 0) {
    return communities.slice().sort((a, b) => {
      if (a.joined !== b.joined) return a.joined ? 1 : -1;
      return activityScore(b) - activityScore(a);
    });
  }

  return communities
    .map((community) => ({
      community,
      relevance: scoreCommunityForWantedSkills(community, wantedSkills),
    }))
    .sort((a, b) => {
      if (b.relevance !== a.relevance) return b.relevance - a.relevance;
      if (a.community.joined !== b.community.joined) return a.community.joined ? 1 : -1;
      return activityScore(b.community) - activityScore(a.community);
    })
    .map(({ community }) => community);
}

/** True when at least one community has a positive skill match. */
export function hasSkillBasedRecommendations(
  communities: ForumCommunity[],
  wantedSkills: WantedSkillRef[]
): boolean {
  if (wantedSkills.length === 0) return false;
  return communities.some((c) => scoreCommunityForWantedSkills(c, wantedSkills) > 0);
}
