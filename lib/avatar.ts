import { isAllowedAvatarUrl } from "@/lib/security";

/**
 * Only SkillBridge storage URLs are shown as profile photos.
 * External/OAuth URLs in the DB are ignored so avatars fall back to initials
 * consistently across the app (top bar, forum, messages, etc.).
 */
export function normalizeAvatarUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  const withoutQuery = trimmed.split(/[?#]/)[0] ?? trimmed;
  if (!isAllowedAvatarUrl(withoutQuery)) return null;
  return trimmed;
}
