export type Skill = {
  skill_id: number;
  skill_name: string;
  category: string;
};

export type Profile = {
  user_id: number;
  fullname: string;
  bio: string | null;
  timezone: string;
  experience_points: number;
  level: number;
  trust_score: number | null; // FR-014: average of session ratings; null if none yet
  created_at: string;
};

export type Review = {
  review_id: number;
  reviewer_id: number;
  reviewer_fullname: string;
  rating: number; // FR-010
  comment: string;
  created_at: string;
};

/** FR-009: +1 point per completed teaching session, level up every 20 points. */
export function xpForNextLevel(level: number) {
  return (level + 1) * 20;
}