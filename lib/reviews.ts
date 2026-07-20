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

/** Session request IDs the user has already reviewed (as reviewer). */
export async function getReviewedSessionIds(
  supabase: SupabaseClient,
  reviewerId: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("reviews")
    .select("session_request_id")
    .eq("reviewer_id", reviewerId)
    .not("session_request_id", "is", null);

  // Column may not exist until supabase/reviews-and-realtime.sql is applied.
  if (error) {
    console.error("[reviews] getReviewedSessionIds:", error.message);
    return new Set();
  }

  return new Set(
    (data ?? [])
      .map((r) => r.session_request_id as string | null)
      .filter((id): id is string => Boolean(id))
  );
}

export async function createSessionReview(
  supabase: SupabaseClient,
  params: {
    reviewerId: string;
    reviewedUserId: string;
    sessionRequestId: string;
    rating: number;
    comment: string;
  }
): Promise<{ error: string | null }> {
  if (params.rating < 1 || params.rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }
  const comment = params.comment.trim();
  if (comment.length < 2) {
    return { error: "Please write a short review (at least 2 characters)." };
  }
  if (comment.length > 500) {
    return { error: "Review must be 500 characters or fewer." };
  }
  if (params.reviewerId === params.reviewedUserId) {
    return { error: "You can't review yourself." };
  }

  const { data: session } = await supabase
    .from("session_requests")
    .select("request_id, requester_id, receiver_id, status")
    .eq("request_id", params.sessionRequestId)
    .maybeSingle();

  if (!session || session.status !== "completed") {
    return { error: "You can only review completed sessions." };
  }

  const isParticipant =
    session.requester_id === params.reviewerId || session.receiver_id === params.reviewerId;
  const partnerId =
    session.requester_id === params.reviewerId ? session.receiver_id : session.requester_id;

  if (!isParticipant || partnerId !== params.reviewedUserId) {
    return { error: "You can only review your session partner." };
  }

  const { data: existing } = await supabase
    .from("reviews")
    .select("review_id")
    .eq("reviewer_id", params.reviewerId)
    .eq("session_request_id", params.sessionRequestId)
    .maybeSingle();

  if (existing) {
    return { error: "You already reviewed this session." };
  }

  const { error: insertError } = await supabase.from("reviews").insert({
    reviewer_id: params.reviewerId,
    reviewed_user_id: params.reviewedUserId,
    session_request_id: params.sessionRequestId,
    rating: params.rating,
    comment,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  const { trustScore } = await getUserReviews(supabase, params.reviewedUserId);
  if (trustScore != null) {
    const { tryCreateSupabaseAdminClient } = await import("@/lib/supabase/admin");
    const admin = tryCreateSupabaseAdminClient();
    if (!admin) {
      console.error("[reviews] SUPABASE_SERVICE_ROLE_KEY missing; trust_score not updated");
    } else {
      const { error: trustError } = await admin
        .from("users")
        .update({ trust_score: Number(trustScore.toFixed(2)) })
        .eq("id", params.reviewedUserId);
      if (trustError) {
        console.error("[reviews] trust_score update failed:", trustError.message);
      }
    }
  }

  return { error: null };
}
