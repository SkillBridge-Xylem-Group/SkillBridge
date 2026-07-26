import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser } from "./isAdmin";
import { getClientIpFromHeaders, isAdminIpAllowed } from "./adminAccess";
import { adminNeedsMfaStep } from "./adminMfa";

/**
 * Guards admin-only pages and route handlers.
 */
export async function requireAdmin(): Promise<{
  user: User;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
}> {
  const headerList = await headers();
  const ip = getClientIpFromHeaders(headerList);
  if (!isAdminIpAllowed(ip)) {
    redirect("/dashboard");
  }

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

  if (await adminNeedsMfaStep(supabase)) {
    redirect("/vault-7q2k?error=mfa-required");
  }

  return { user, supabase };
}
