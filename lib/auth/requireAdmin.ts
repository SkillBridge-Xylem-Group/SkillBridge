import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser } from "./isAdmin";

/**
 * Guards admin-only pages and route handlers.
 *
 * `proxy.ts` already ensures the caller is logged in for anything under
 * `/dashboard`, but it has no concept of role. This checks the caller's
 * membership in the `admins` table (see isAdmin.ts for why) and redirects
 * non-admins back to the regular dashboard, so a normal user hitting
 * `/dashboard/admin/...` directly never sees admin data or UI.
 *
 * Note: this only protects rendering/routing on our side. The Supabase
 * client here still uses the anon key, so the underlying RLS policies on
 * `users`/`reports`/etc. must also allow admins to read/update rows beyond
 * their own for the admin pages to actually see data.
 */
export async function requireAdmin(): Promise<{
  user: User;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
}> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!(await isAdminUser(supabase, user.id))) {
    redirect("/dashboard");
  }

  return { user, supabase };
}