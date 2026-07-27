import type { SupabaseClient } from "@supabase/supabase-js";
import { tryCreateSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Admin status is determined by membership in the `admins` table — the same
 * thing your RLS policies on `reports` (and now `users`) already check via
 * `exists (select 1 from admins where user_id = auth.uid())`.
 *
 * `users.role` is intentionally NOT used here. It's a separate column that
 * isn't wired into any RLS policy, so treating it as authoritative would
 * let it silently drift out of sync with what the database actually
 * enforces (e.g. a `role = 'admin'` account that isn't in `admins` would
 * pass a page-level check but get blocked/empty results on real queries).
 *
 * On the server, prefer the service-role client so admin login still works
 * when `admins` has no SELECT policy for authenticated users.
 */
export async function isAdminUser(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const privileged = tryCreateSupabaseAdminClient();
  const client = privileged ?? supabase;

  const { data, error } = await client
    .from("admins")
    .select("admin_id")
    .eq("user_id", userId)
    .maybeSingle();

  return !error && !!data;
}

/**
 * Returns the user_ids of everyone in the `admins` table, so callers can
 * exclude admin accounts from user-facing listings (browse, matches, etc.)
 * without relying on `users.role`, which isn't kept in sync — see the note
 * above. Returns an empty array (rather than throwing) on query failure so
 * callers fail open to "no admins to exclude" instead of breaking listings.
 */
export async function getAdminUserIds(supabase: SupabaseClient): Promise<string[]> {
  const privileged = tryCreateSupabaseAdminClient();
  const client = privileged ?? supabase;

  const { data, error } = await client.from("admins").select("user_id");

  if (error || !data) return [];
  return data.map((row) => row.user_id as string);
}