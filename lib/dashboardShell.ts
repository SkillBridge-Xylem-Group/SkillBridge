import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { normalizeAvatarUrl } from "@/lib/avatar";

export type DashboardShellData = {
  userId: string | null;
  userName: string;
  level: number;
  xp: number;
  trustScore: number | null;
  avatarUrl: string | null;
  initialLocale: AppLocale | null;
};

/**
 * One getUser + supabase client per RSC request (shared by layout + pages).
 *
 * Also the single choke point for the suspension check: every non-admin
 * dashboard page and the layout wrapping them call this (directly or via
 * getDashboardShellData), and React's cache() means the body below only
 * actually runs once per request no matter how many callers there are.
 * Admin pages go through requireAdmin() instead and never hit this, but
 * that's fine — setUserSuspensionAction already refuses to suspend any
 * admin account (or your own), so an admin session can never carry
 * is_suspended = true.
 */
export const getRequestUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: statusRow } = await supabase
      .from("users")
      .select("is_suspended")
      .eq("id", user.id)
      .maybeSingle();

    if (statusRow?.is_suspended) {
      await supabase.auth.signOut();
      redirect("/login?error=account-suspended");
    }
  }

  return { supabase, user };
});

/**
 * Lightweight shell only — no sidebar communities (loaded client-side so
 * layout paint / soft navigations are not blocked on membership queries).
 */
export const getDashboardShellData = cache(async (): Promise<DashboardShellData> => {
  const { supabase, user } = await getRequestUser();

  if (!user) {
    return {
      userId: null,
      userName: "there",
      level: 0,
      xp: 0,
      trustScore: null,
      avatarUrl: null,
      initialLocale: null,
    };
  }

  const profileResult = await supabase
    .from("users")
    .select("fullname, experience_points, level, language, trust_score, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  let row = profileResult.data as {
    fullname: string | null;
    experience_points: number | null;
    level: number | null;
    language?: string | null;
    trust_score?: number | null;
    avatar_url?: string | null;
  } | null;

  if (profileResult.error) {
    const fallback = await supabase
      .from("users")
      .select("fullname, experience_points, level, trust_score")
      .eq("id", user.id)
      .maybeSingle();
    row = fallback.data;
  }

  return {
    userId: user.id,
    userName: row?.fullname || "there",
    level: row?.level ?? 0,
    xp: row?.experience_points ?? 0,
    trustScore: row?.trust_score ? row.trust_score : null,
    avatarUrl: normalizeAvatarUrl(row?.avatar_url ?? null),
    initialLocale: isAppLocale(row?.language) ? row!.language! : null,
  };
});
