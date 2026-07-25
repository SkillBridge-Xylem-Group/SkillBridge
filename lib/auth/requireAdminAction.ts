import { headers } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { requireActiveServerUser } from "@/lib/auth/requireActiveServerUser";
import { getClientIpFromHeaders, isAdminIpAllowed } from "@/lib/auth/adminAccess";
import { adminNeedsMfaStep } from "@/lib/auth/adminMfa";
import { isAdminUser } from "@/lib/auth/isAdmin";

type AdminServerActionSuccess = {
  ok: true;
  user: User;
  supabase: SupabaseClient;
};

type AdminServerActionFailure = {
  ok: false;
  error: string;
};

export type RequireAdminServerActionResult = AdminServerActionSuccess | AdminServerActionFailure;

/** Auth + IP + MFA gate for admin Server Actions. */
export async function requireAdminServerAction(): Promise<RequireAdminServerActionResult> {
  const headerList = await headers();
  if (!isAdminIpAllowed(getClientIpFromHeaders(headerList))) {
    return { ok: false, error: "Access denied from this network." };
  }

  const session = await requireActiveServerUser();
  if (!session.ok) return { ok: false, error: session.error };

  const { user, supabase } = session;
  if (!(await isAdminUser(supabase, user.id))) {
    return { ok: false, error: "Not authorized." };
  }

  if (await adminNeedsMfaStep(supabase)) {
    return { ok: false, error: "Two-factor verification required." };
  }

  return { ok: true, user, supabase };
}
