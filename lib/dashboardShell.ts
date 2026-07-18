import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";

export type DashboardShellData = {
  userId: string | null;
  userName: string;
  level: number;
  xp: number;
  trustScore: number | null;
  initialLocale: AppLocale | null;
};

/** One getUser + supabase client per RSC request (shared by layout + pages). */
export const getRequestUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
      initialLocale: null,
    };
  }

  const profileResult = await supabase
    .from("users")
    .select("fullname, experience_points, level, language, trust_score")
    .eq("id", user.id)
    .maybeSingle();

  let row = profileResult.data as {
    fullname: string | null;
    experience_points: number | null;
    level: number | null;
    language?: string | null;
    trust_score?: number | null;
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
    initialLocale: isAppLocale(row?.language) ? row!.language! : null,
  };
});
