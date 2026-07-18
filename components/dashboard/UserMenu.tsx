"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { signOutEverywhere } from "@/lib/auth/sign-out";

type UserMenuProps = {
  name: string;
};

export default function UserMenu({ name }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      // Hard navigation clears bfcache so a signed-out session cannot reopen.
      // Keep static asset caching (no cache-bust query) for faster login paint.
      window.location.replace("/login?loggedOut=1");
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-1.5 transition hover:bg-slate-100 sm:gap-2.5 sm:pr-2.5"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden min-w-0 text-left lg:block">
          <p className="truncate text-sm font-bold text-slate-900">{name}</p>
        </div>
        <ChevronDown size={16} className={`hidden text-slate-400 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl"
        >
          <Link
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <User size={16} />
            My Profile
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Settings size={16} />
            Settings
          </Link>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <LogOut size={16} />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
}
