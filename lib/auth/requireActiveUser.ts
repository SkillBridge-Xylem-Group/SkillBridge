import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RequireActiveUserResult =
  | { user: User; supabase: SupabaseClient; error: null }
  | { user: null; supabase: null; error: NextResponse };

/**
 * Auth check for API route handlers: verifies the caller is logged in AND
 * not suspended, in one call. Returns a ready-to-return NextResponse in
 * `error` when the check fails, so call sites stay a two-line early-return
 * same as the plain `auth.getUser()` pattern they're replacing.
 *
 * This exists because getRequestUser() in dashboardShell.ts only guards
 * RSC page loads under /dashboard/*. API routes under /api/* have their
 * own auth checks and were never covered by that fix — a suspended user
 * with an already-loaded page could still hit these endpoints directly
 * (send messages, edit profile, etc.) until they next navigate a
 * dashboard page. Use this here instead of a bare auth.getUser() call.
 */
export async function requireActiveUser(): Promise<RequireActiveUserResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      supabase: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: statusRow } = await supabase
    .from("users")
    .select("is_suspended")
    .eq("id", user.id)
    .maybeSingle();

  if (statusRow?.is_suspended) {
    await supabase.auth.signOut();
    return {
      user: null,
      supabase: null,
      error: NextResponse.json({ error: "Account suspended" }, { status: 403 }),
    };
  }

  return { user, supabase, error: null };
}
