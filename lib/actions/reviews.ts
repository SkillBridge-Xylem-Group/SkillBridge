"use server";

import { revalidatePath } from "next/cache";
import { requireActiveServerUser } from "@/lib/auth/requireActiveServerUser";
import { createSessionReview } from "@/lib/reviews";
import { createNotification } from "@/lib/notifications";
import { awardReviewReceivedXp } from "@/lib/gamification";

export async function submitSessionReviewAction(params: {
  sessionRequestId: string;
  reviewedUserId: string;
  rating: number;
  comment: string;
}) {
  const session = await requireActiveServerUser();
  if (!session.ok) return { error: session.error };
  const { user, supabase } = session;

  const { error } = await createSessionReview(supabase, {
    reviewerId: user.id,
    reviewedUserId: params.reviewedUserId,
    sessionRequestId: params.sessionRequestId,
    rating: params.rating,
    comment: params.comment,
  });

  if (error) return { error };

  await awardReviewReceivedXp(supabase, params.reviewedUserId, params.rating);

  const { data: reviewerRow } = await supabase.from("users").select("fullname").eq("id", user.id).maybeSingle();
  await createNotification(supabase, {
    userId: params.reviewedUserId,
    type: "review_received",
    message: `${reviewerRow?.fullname ?? "Someone"} left you a ${params.rating}-star review`,
    relatedEntityType: "user",
    relatedEntityId: user.id,
  });

  revalidatePath("/dashboard/swap-requests");
  revalidatePath("/dashboard/profile");
  revalidatePath(`/dashboard/profile`);
  return { success: true };
}
