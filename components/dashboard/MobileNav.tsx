"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { DASHBOARD_NAV_ITEMS, isDashboardNavActive } from "@/lib/dashboard-nav";
import type { SidebarCommunity } from "@/lib/forumCommunities";
import { useLocale } from "@/components/i18n/LocaleProvider";
import SidebarCommunities from "./SidebarCommunities";
import { usePendingNav } from "./DashboardChrome";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  communities?: SidebarCommunity[];
};

export function MobileNavDrawer({ open, onClose, communities = [] }: MobileNavDrawerProps) {
  const pathname = usePathname();
  const { pendingHref, navigate } = usePendingNav();
  const { dictionary } = useLocale();
  const activePath = pendingHref ?? pathname;

  const labels = {
    home: dictionary.nav.home,
    browse: dictionary.nav.browse,
    swaps: dictionary.nav.swaps,
    forum: dictionary.nav.forum,
  } as const;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close drawer on route change only
  }, [pathname]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label={dictionary.nav.closeMenu}
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <aside
        className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={dictionary.nav.navigationLabel}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/dashboard" onClick={onClose} className="inline-flex items-center gap-2">
            <Image
              src="/images/logo-mark-v2.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0"
            />
            <span className="text-lg font-extrabold nb-heading">SkillBridge</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label={dictionary.common.close}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isDashboardNavActive(activePath, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={(e) => {
                  onClose();
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  navigate(item.href);
                }}
                className={`nb-nav-link flex items-center gap-3 px-4 py-3 text-sm ${active ? "active" : ""}`}
              >
                <Icon size={18} />
                {labels[item.key]}
              </Link>
            );
          })}
          <Link
            href="/dashboard/messages"
            prefetch
            onClick={onClose}
            className={`nb-nav-link flex items-center gap-3 px-4 py-3 text-sm ${
              activePath.startsWith("/dashboard/messages") ? "active" : ""
            }`}
          >
            <MessageSquare size={18} />
            {dictionary.messages.title}
          </Link>
          <SidebarCommunities communities={communities} onNavigate={onClose} />
        </nav>
      </aside>
    </div>
  );
}

/** Fixed bottom tab bar for phones / tablets below the lg breakpoint. */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { pendingHref, navigate } = usePendingNav();
  const { dictionary } = useLocale();
  const activePath = pendingHref ?? pathname;

  const shortLabels = {
    home: dictionary.nav.home,
    browse: dictionary.nav.browseShort,
    swaps: dictionary.nav.swapsShort,
    forum: dictionary.nav.forumShort,
  } as const;

  return (
    <nav
      aria-label={dictionary.nav.primaryNav}
      className="fixed inset-x-0 bottom-0 z-40 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      style={{ boxShadow: "0 -2px 10px rgba(20,24,20,.05)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pt-1">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isDashboardNavActive(activePath, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                prefetch
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  navigate(item.href);
                }}
                className="flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-bold"
                style={{ color: active ? "var(--sb-teal-dark)" : "var(--sb-muted)" }}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className="truncate">{shortLabels[item.key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
