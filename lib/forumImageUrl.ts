/** Allowed remote image URLs for forum posts and replies. */
export function getSafeForumImageUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();

  if (/^https:\/\/[a-z0-9.-]+\.supabase\.co\/storage\/v1\/object\/public\/forum-images\//i.test(trimmed)) {
    return trimmed;
  }

  // GIPHY CDN (selected from the official picker API).
  if (/^https:\/\/(?:media\d*\.)?giphy\.com\/media\//i.test(trimmed)) {
    return trimmed;
  }
  if (/^https:\/\/i\.giphy\.com\//i.test(trimmed)) {
    return trimmed;
  }

  return null;
}
