import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RequireActiveServerUserResult =
  | { ok: true; user: User; supabase: SupabaseClient }
  | { ok: false; error: string };

/**
 * Auth check for Server Actions: verifies the caller is logged in AND not
 * suspended. Mirrors requireActiveUser() used by API routes.
 */
export async function requireActiveServerUser(): Promise<RequireActiveServerUserResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: "You need to be signed in." };
  }

  const { data: statusRow } = await supabase
    .from("users")
    .select("is_suspended")
    .eq("id", user.id)
    .maybeSingle();

  if (statusRow?.is_suspended) {
    await supabase.auth.signOut();
    return { ok: false, error: "Your account has been suspended." };
  }

  return { ok: true, user, supabase };
}
