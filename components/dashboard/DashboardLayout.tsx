import { type ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserReviews } from "@/lib/reviews";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { MobileBottomNav } from "./MobileNav";

type DashboardLayoutProps = {
  children: ReactNode;
  userName?: string;
  level?: number;
  xp?: number;
};

export default async function DashboardLayout({
  children,
  userName = "there",
  level,
  xp,
}: DashboardLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let shellName = userName;
  let shellLevel = level ?? 0;
  let shellXp = xp ?? 0;
  let trustScore: number | null = null;
  let avatarUrl: string | null = null;

  if (user) {
    const [{ data: row }, reviews] = await Promise.all([
      supabase
        .from("users")
        .select("fullname, experience_points, level, avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
      getUserReviews(supabase, user.id),
    ]);

    if (row) {
      if (userName === "there" && row.fullname) {
        shellName = row.fullname;
      }
      shellLevel = row.level ?? shellLevel;
      shellXp = row.experience_points ?? shellXp;
      avatarUrl = row.avatar_url ?? null;
    }
    trustScore = reviews.trustScore;
  }

  return (
    <div className="nb-page flex min-h-screen">
      <Sidebar level={shellLevel} experiencePoints={shellXp} trustScore={trustScore} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          userName={shellName}
          level={`Level ${shellLevel}`}
          xp={shellXp}
          levelNumber={shellLevel}
          trustScore={trustScore}
          avatarUrl={avatarUrl}
        />
        <main className="px-4 pb-24 pt-4 sm:px-8 lg:px-10 lg:pb-10 lg:pt-5">{children}</main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
