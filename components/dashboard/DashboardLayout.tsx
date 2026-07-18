import { type ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserReviews } from "@/lib/reviews";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { MobileBottomNav } from "./MobileNav";

type DashboardLayoutProps = {
  children: ReactNode;
  userName?: string;
  level?: number;
  xp?: number;
  /** Optional className override/extra for the main content region. */
  mainClassName?: string;
};

export default async function DashboardLayout({
  children,
  userName = "there",
  level,
  xp,
  mainClassName,
}: DashboardLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let shellName = userName;
  let shellLevel = level ?? 0;
  let shellXp = xp ?? 0;
  let trustScore: number | null = null;
  let initialLocale: AppLocale | null = null;

  if (user) {
    const [profileResult, reviews] = await Promise.all([
      supabase
        .from("users")
        .select("fullname, experience_points, level, language")
        .eq("id", user.id)
        .maybeSingle(),
      getUserReviews(supabase, user.id),
    ]);

    let row = profileResult.data as {
      fullname: string | null;
      experience_points: number | null;
      level: number | null;
      language?: string | null;
    } | null;

    if (profileResult.error) {
      const fallback = await supabase
        .from("users")
        .select("fullname, experience_points, level")
        .eq("id", user.id)
        .maybeSingle();
      row = fallback.data;
    }

    if (row) {
      if (userName === "there" && row.fullname) {
        shellName = row.fullname;
      }
      shellLevel = row.level ?? shellLevel;
      shellXp = row.experience_points ?? shellXp;
      if (isAppLocale(row.language)) initialLocale = row.language;
    }
    trustScore = reviews.trustScore;
  }

  return (
    <LocaleProvider initialLocale={initialLocale}>
      <div className="flex min-h-screen bg-[#F7F7FB]">
        <Sidebar level={shellLevel} experiencePoints={shellXp} trustScore={trustScore} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            userName={shellName}
            level={`Level ${shellLevel}`}
            xp={shellXp}
            levelNumber={shellLevel}
            trustScore={trustScore}
          />
          <main
            className={
              mainClassName ?? "px-4 pb-24 pt-4 sm:px-8 lg:px-10 lg:pb-10 lg:pt-5"
            }
          >
            {children}
          </main>
        </div>

        <MobileBottomNav />
      </div>
    </LocaleProvider>
  );
}
