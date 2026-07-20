"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { DashboardShellData } from "@/lib/dashboardShell";
import type { SidebarCommunity } from "@/lib/forumCommunities";
import { DASHBOARD_NAV_ITEMS } from "@/lib/dashboard-nav";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { MobileBottomNav } from "./MobileNav";
import NavigationProgressBar from "./NavigationProgressBar";

const COMMUNITIES_CACHE_KEY = "sb-sidebar-communities-v1";

type PendingNavContextValue = {
  pendingHref: string | null;
  navigate: (href: string) => void;
};

const PendingNavContext = createContext<PendingNavContextValue>({
  pendingHref: null,
  navigate: () => {},
});

export function usePendingNav() {
  return useContext(PendingNavContext);
}

function readCommunitiesCache(): SidebarCommunity[] {
  try {
    const raw = sessionStorage.getItem(COMMUNITIES_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { at: number; communities: SidebarCommunity[] };
    if (!parsed?.communities || !Array.isArray(parsed.communities)) return [];
    // Reuse for 5 minutes across soft navigations.
    if (Date.now() - parsed.at > 5 * 60_000) return parsed.communities;
    return parsed.communities;
  } catch {
    return [];
  }
}

function writeCommunitiesCache(communities: SidebarCommunity[]) {
  try {
    sessionStorage.setItem(
      COMMUNITIES_CACHE_KEY,
      JSON.stringify({ at: Date.now(), communities })
    );
  } catch {
    // ignore
  }
}

type DashboardChromeProps = {
  shell: DashboardShellData;
  children: ReactNode;
  mainClassName?: string;
};

/** Persistent dashboard chrome — freezes shell on mount like a SPA shell. */
export default function DashboardChrome({
  shell: initialShell,
  children,
  mainClassName,
}: DashboardChromeProps) {
  // Freeze first paint values so soft navigations don't flash/refetch chrome,
  // but re-sync when the server actually hands us new values (e.g. a
  // router.refresh() after the user edits their name/photo/etc.) — plain
  // client-side nav between dashboard pages never re-renders this layout,
  // so this effect only fires on a real data change, not on every click.
  const [shell, setShell] = useState(initialShell);
  useEffect(() => {
    setShell(initialShell);
  }, [
    initialShell.userName,
    initialShell.avatarUrl,
    initialShell.level,
    initialShell.xp,
    initialShell.trustScore,
    initialShell.initialLocale,
  ]);
  const [communities, setCommunities] = useState<SidebarCommunity[]>([]);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const cached = readCommunitiesCache();
    if (cached.length > 0) setCommunities(cached);

    let cancelled = false;

    async function loadCommunities() {
      try {
        const res = await fetch("/api/forum/sidebar-communities", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { communities?: SidebarCommunity[] };
        if (cancelled || !data.communities) return;
        setCommunities(data.communities);
        writeCommunitiesCache(data.communities);
      } catch {
        // keep cache / empty
      }
    }

    void loadCommunities();

    function onInvalidate() {
      void loadCommunities();
    }
    window.addEventListener("sb-sidebar-communities", onInvalidate);

    return () => {
      cancelled = true;
      window.removeEventListener("sb-sidebar-communities", onInvalidate);
    };
  }, []);

  // Prefetch primary routes so the first click is often already warm.
  useEffect(() => {
    for (const item of DASHBOARD_NAV_ITEMS) {
      router.prefetch(item.href);
    }
    router.prefetch("/dashboard/messages");
    router.prefetch("/dashboard/settings");
    router.prefetch("/dashboard/forum/communities");
  }, [router]);

  useEffect(() => {
    if (!isPending) setPendingHref(null);
  }, [isPending]);

  const navigate = useCallback(
    (href: string) => {
      setPendingHref(href);
      startTransition(() => {
        router.push(href);
      });
    },
    [router]
  );

  return (
    <LocaleProvider initialLocale={shell.initialLocale}>
      <PendingNavContext.Provider value={{ pendingHref, navigate }}>
        <Suspense fallback={null}>
          <NavigationProgressBar active={isPending} />
        </Suspense>
        <div className="nb-page flex min-h-screen items-start gap-0 p-0 lg:gap-5 lg:p-5">
          <Sidebar communities={communities} />

          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar userName={shell.userName} avatarUrl={shell.avatarUrl} communities={communities} />
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
      </PendingNavContext.Provider>
    </LocaleProvider>
  );
}

/** Call after join/leave/create so the sidebar membership list refreshes. */
export function invalidateSidebarCommunitiesCache() {
  try {
    sessionStorage.removeItem(COMMUNITIES_CACHE_KEY);
  } catch {
    // ignore
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("sb-sidebar-communities"));
  }
}
