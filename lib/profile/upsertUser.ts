import type { SupabaseClient, User } from "@supabase/supabase-js";
import { deriveNameFromEmail } from "@/lib/deriveName";
import { generateUniqueSlug } from "@/lib/slug";

type UserFields = {
  fullname?: string;
  bio?: string;
  timezone?: string;
  avatar_url?: string;
  gender?: string | null;
  location_preference?: string | null;
  language?: string | null;
};

/**
 * Updates the caller's `users` row with the given fields. If no row exists
 * yet (first save for this account — there's no signup trigger that creates
 * one automatically), inserts a fresh row instead, filling in the NOT NULL
 * columns (email, fullname, role, experience_points, level, trust_score)
 * that `fields` doesn't cover so the insert never hits a constraint error.
 */
export async function updateOrCreateUser(
  supabase: SupabaseClient,
  user: User,
  fields: UserFields
): Promise<{ error: { message: string } | null }> {
  if (Object.keys(fields).length > 0) {
    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update(fields)
      .eq("id", user.id)
      .select("id")
      .maybeSingle();

    if (updateError) return { error: updateError };
    if (updated) return { error: null };
  } else {
    const { data: existing } = await supabase.from("users").select("id").eq("id", user.id).maybeSingle();
    if (existing) return { error: null };
  }

  const fallbackName =
    fields.fullname ||
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    (user.email ? deriveNameFromEmail(user.email) : "New User");

  const slug = await generateUniqueSlug(supabase, fallbackName);

  const { error: insertError } = await supabase.from("users").insert({
    id: user.id,
    email: user.email ?? "",
    fullname: fallbackName,
    slug,
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
