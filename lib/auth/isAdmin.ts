import type { SupabaseClient } from "@supabase/supabase-js";

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
 */
export async function isAdminUser(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("admins")
    .select("admin_id")
    .eq("user_id", userId)
    .maybeSingle();

  return !error && !!data;
}