import type { Skill } from "@/lib/types/profile";

// Shared source of truth for skill tags, keyed by the same subject names used
// in the onboarding subject dropdowns. Used both to pick which tags to show
// per subject during onboarding, and to build the full skill catalog / infer
// a category for skills already saved on a profile.
export const SKILL_CATEGORIES: Record<string, string[]> = {
  "Software Development (Web, Mobile)": [
    "HTML/CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Python",
    "Node.js",
    "Database ERD",
    "UI Layouts",
    "Mobile Development",
    "API Design",
  ],
  "Design & UI/UX": [
    "Figma",
    "Wireframing",
    "UI Design",
    "Graphic Design",
    "Canva",
    "User Research",
    "Prototyping",
    "Adobe XD",
    "Illustrator",
    "Branding",
  ],
  "Business & Marketing": [
    "Copywriting",
    "Project Management",
    "SEO",
    "Social Media",
    "Business Strategy",
    "Sales",
    "Branding",
    "Market Research",
  ],
  Languages: [
    "English",
    "Spanish",
    "Italian",
    "French",
    "German",
    "Mandarin",
    "Japanese",
    "Korean",
    "Arabic",
    "Portuguese",
  ],
  Music: ["Guitar", "Piano", "Vocals", "Music Theory", "Music Production", "Drums", "Violin", "Songwriting"],
  Cooking: ["Baking", "Italian Cuisine", "Asian Cuisine", "Grilling", "Pastry", "Meal Prep", "Vegan Cooking", "Knife Skills"],
};

export function getSkillCategory(skillName: string): string {
  for (const [category, tags] of Object.entries(SKILL_CATEGORIES)) {
    if (tags.includes(skillName)) return category;
  }
  return "Other";
}

/** Full flattened catalog, for the profile page's add-skill picker. */
export function getFullSkillCatalog(): Skill[] {
  let skillId = 1;
  const catalog: Skill[] = [];
  for (const [category, tags] of Object.entries(SKILL_CATEGORIES)) {
    for (const tag of tags) {
      catalog.push({ skill_id: skillId++, skill_name: tag, category });
    }
  }
  return catalog;
}

/**
 * Turns the flat tag strings stored on a profile row into Skill objects,
 * reusing the real catalog skill_id so these line up with availableSkills
 * (and don't collide with each other) instead of renumbering from scratch.
 * Tags that don't match any known catalog entry (e.g. a free-typed "Other"
 * subject) get a synthetic id in a range the catalog never uses.
 */
export function tagsToSkills(tags: string[] | null | undefined): Skill[] {
  const catalog = getFullSkillCatalog();
  let syntheticId = 100000;
  return (tags ?? []).map((name) => {
    const match = catalog.find((skill) => skill.skill_name === name);
    return match ?? { skill_id: syntheticId++, skill_name: name, category: "Other" };
  });
}
