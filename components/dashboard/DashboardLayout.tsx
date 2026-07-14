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

  if (user) {
    const [{ data: row }, reviews] = await Promise.all([
      supabase
        .from("users")
        .select("fullname, experience_points, level")
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
    }
    trustScore = reviews.trustScore;
  }

  return (
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
        <main className="px-4 pb-24 sm:px-8 lg:px-10 lg:pb-10">{children}</main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
