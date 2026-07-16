"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSessionReview } from "@/lib/reviews";
import { createNotification } from "@/lib/notifications";

export async function submitSessionReviewAction(params: {
  sessionRequestId: string;
  reviewedUserId: string;
  rating: number;
  comment: string;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const { error } = await createSessionReview(supabase, {
    reviewerId: user.id,
    reviewedUserId: params.reviewedUserId,
    sessionRequestId: params.sessionRequestId,
    rating: params.rating,
    comment: params.comment,
  });

  if (error) return { error };

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
