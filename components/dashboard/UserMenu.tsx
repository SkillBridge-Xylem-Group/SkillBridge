"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import UserAvatar from "@/components/ui/UserAvatar";
import { signOutEverywhere } from "@/lib/auth/sign-out";

type UserMenuProps = {
  name: string;
  avatarUrl?: string | null;
};

export default function UserMenu({ name, avatarUrl = null }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { dictionary } = useLocale();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOutEverywhere();
    } finally {
      window.location.replace(`/login?loggedOut=1&t=${Date.now()}`);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="nb-chip flex items-center gap-2 py-1 pl-1 pr-2.5 transition hover:-translate-y-0.5 sm:gap-2.5 sm:pr-3.5"
      >
        <UserAvatar name={name} avatarUrl={avatarUrl} className="h-8 w-8 text-xs" />
        <div className="hidden min-w-0 text-left lg:block">
          <p className="truncate text-sm font-bold" style={{ color: "var(--sb-ink)" }}>{name}</p>
        </div>
        <ChevronDown size={16} className={`hidden transition-transform sm:block ${open ? "rotate-180" : ""}`} style={{ color: "var(--sb-muted)" }} />
      </button>

      {open && (
        <div
          role="menu"
          className="nb-card absolute right-0 z-40 mt-2 w-56 overflow-hidden !rounded-2xl bg-white py-2"
        >
          <Link
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            style={{ color: "var(--sb-ink)" }}
          >
            <User size={16} />
            {dictionary.menu.myProfile}
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            style={{ color: "var(--sb-ink)" }}
          >
            <Settings size={16} />
            {dictionary.menu.settings}
          </Link>
          <div className="my-1.5 h-px bg-slate-100" role="separator" />
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <LogOut size={16} />
            {isLoggingOut ? dictionary.menu.loggingOut : dictionary.menu.logout}
          </button>
        </div>
      )}
    </div>
  );
}