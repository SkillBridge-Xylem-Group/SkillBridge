import { type ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { listUserSidebarCommunities, type SidebarCommunity } from "@/lib/forumCommunities";
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
  mainClassName,
}: DashboardLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let shellName = userName;
  let avatarUrl: string | null = null;
  let initialLocale: AppLocale | null = null;
  let communities: SidebarCommunity[] = [];

  if (user) {
    const [profileResult, sidebarCommunities] = await Promise.all([
      supabase
        .from("users")
        .select("fullname, avatar_url, language")
        .eq("id", user.id)
        .maybeSingle(),
      listUserSidebarCommunities(supabase, user.id),
    ]);

    communities = sidebarCommunities;

    let row = profileResult.data as {
      fullname: string | null;
      avatar_url?: string | null;
      language?: string | null;
    } | null;

    if (profileResult.error) {
      const fallback = await supabase.from("users").select("fullname").eq("id", user.id).maybeSingle();
      row = fallback.data;
    }

    if (row) {
      if (userName === "there" && row.fullname) {
        shellName = row.fullname;
      }
      avatarUrl = row.avatar_url ?? null;
      if (isAppLocale(row.language)) initialLocale = row.language;
    }
  }

  return (
    <LocaleProvider initialLocale={initialLocale}>
      <div className="nb-page flex min-h-screen items-start gap-0 p-0 lg:gap-5 lg:p-5">
        <Sidebar communities={communities} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar userName={shellName} avatarUrl={avatarUrl} communities={communities} />
          <main
            className={
              mainClassName ?? "px-4 pb-24 pt-4 sm:px-8 lg:px-0 lg:pb-10 lg:pt-5"
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
