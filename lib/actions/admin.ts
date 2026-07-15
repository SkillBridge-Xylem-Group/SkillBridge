"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth/isAdmin";

export async function setUserSuspensionAction(params: {
  userId: string;
  suspend: boolean;
  reason?: string;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };
  if (!(await isAdminUser(supabase, user.id))) return { error: "Not authorized." };

  if (params.userId === user.id) {
    return { error: "You can't suspend your own account." };
  }

  if (await isAdminUser(supabase, params.userId)) {
    return { error: "Can't suspend another admin account." };
  }

  const { error } = await supabase
    .from("users")
    .update({
      is_suspended: params.suspend,
      suspended_at: params.suspend ? new Date().toISOString() : null,
      suspended_reason: params.suspend ? params.reason?.trim() || null : null,
    })
    .eq("id", params.userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function updateReportStatusAction(params: {
  reportId: string;
  status: "pending" | "reviewed" | "dismissed" | "actioned";
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };
  if (!(await isAdminUser(supabase, user.id))) return { error: "Not authorized." };

  const { error } = await supabase
    .from("reports")
    .update({ status: params.status })
    .eq("report_id", params.reportId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/reports");
  return { success: true };
}