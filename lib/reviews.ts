import type { SupabaseClient } from "@supabase/supabase-js";
import type { Review } from "@/lib/types/profile";

type UserReviews = {
  reviews: Review[];
  trustScore: number | null; // FR-014: average of reviews.rating, null until the first review
  reviewCount: number;
};

/** Reviews a given user has received, plus the trust score derived from them. */
export async function getUserReviews(supabase: SupabaseClient, userId: string): Promise<UserReviews> {
  const { data: rows } = await supabase
    .from("reviews")
    .select("review_id, reviewer_id, rating, comment, created_at")
    .eq("reviewed_user_id", userId)
    .order("created_at", { ascending: false });

  const reviewRows = rows ?? [];
  if (reviewRows.length === 0) {
    return { reviews: [], trustScore: null, reviewCount: 0 };
  }

  const reviewerIds = [...new Set(reviewRows.map((r) => r.reviewer_id))];
  const { data: reviewers } = await supabase.from("users").select("id, fullname").in("id", reviewerIds);
  const nameById = new Map((reviewers ?? []).map((u) => [u.id, u.fullname]));

  const reviews: Review[] = reviewRows.map((r) => ({
    review_id: r.review_id,
    reviewer_id: r.reviewer_id,
    reviewer_fullname: nameById.get(r.reviewer_id) ?? "Unknown",
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
  }));

  const trustScore = reviewRows.reduce((sum, r) => sum + r.rating, 0) / reviewRows.length;

  return { reviews, trustScore, reviewCount: reviewRows.length };
}
