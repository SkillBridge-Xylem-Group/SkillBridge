import { checkRateLimitAsync, type RateLimitResult } from "@/lib/auth/rate-limit";

export const ACTION_RATE_LIMITS = {
  forumPost: { bucket: "forum:post", max: 10, windowMs: 10 * 60_000 },
  forumComment: { bucket: "forum:comment", max: 30, windowMs: 10 * 60_000 },
  messageSend: { bucket: "message:send", max: 60, windowMs: 10 * 60_000 },
} as const;

export async function checkUserActionRateLimit(
  bucket: string,
  userId: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  return checkRateLimitAsync(bucket, `user:${userId}`, maxAttempts, windowMs);
}

export function actionRateLimitError(retryAfterMs: number): string {
  const seconds = Math.ceil(retryAfterMs / 1000);
  if (seconds <= 60) {
    return "You're doing that too fast. Please wait a minute and try again.";
  }
  const minutes = Math.ceil(seconds / 60);
  return `You're doing that too fast. Please wait ${minutes} minutes and try again.`;
}
