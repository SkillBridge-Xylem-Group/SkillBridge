import type { SupabaseClient, User } from "@supabase/supabase-js";
import { deriveNameFromEmail } from "@/lib/deriveName";
import { isUsernameAvailable, validateUsernameFormat } from "@/lib/username";

type UserFields = {
  fullname?: string;
  bio?: string;
  timezone?: string;
  avatar_url?: string;
  gender?: string | null;
  location_preference?: string | null;
  language?: string | null;
  slug?: string;
};

/**
 * Updates the caller's `users` row with the given fields. If no row exists
 * yet, inserts one — but only when a valid, available `slug` (username) is provided.
 */
export async function updateOrCreateUser(
  supabase: SupabaseClient,
  user: User,
  fields: UserFields
): Promise<{ error: { message: string } | null }> {
  if (Object.keys(fields).length > 0) {
    const { slug, ...rest } = fields;
    const updatePayload: Record<string, unknown> = { ...rest };

    if (slug) {
      const format = validateUsernameFormat(slug);
      if (!("ok" in format)) {
        return { error: { message: format.error } };
      }
      const available = await isUsernameAvailable(supabase, format.username, user.id);
      if (!available) {
        return { error: { message: "TAKEN" } };
      }
      updatePayload.slug = format.username;
    }

    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", user.id)
      .select("id")
      .maybeSingle();

    if (updateError) return { error: updateError };
    if (updated) return { error: null };
  } else {
    const { data: existing } = await supabase.from("users").select("id").eq("id", user.id).maybeSingle();
    if (existing) return { error: null };
  }

  if (!fields.slug) {
    return { error: { message: "USERNAME_REQUIRED" } };
  }

  const format = validateUsernameFormat(fields.slug);
  if (!("ok" in format)) {
    return { error: { message: format.error } };
  }
  const available = await isUsernameAvailable(supabase, format.username, user.id);
  if (!available) {
    return { error: { message: "TAKEN" } };
  }

  const fallbackName =
    fields.fullname ||
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    (user.email ? deriveNameFromEmail(user.email) : "New User");

  const { error: insertError } = await supabase.from("users").insert({
    id: user.id,
    email: user.email ?? "",
    fullname: fallbackName,
    slug: format.username,
    bio: fields.bio ?? null,
    timezone: fields.timezone ?? null,
    avatar_url: fields.avatar_url ?? null,
    gender: fields.gender ?? null,
    location_preference: fields.location_preference ?? null,
    language: fields.language ?? null,
    experience_points: 0,
    level: 0,
    trust_score: 0,
    role: "user",
  });

  return { error: insertError };
}
