"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { signOutEverywhere } from "@/lib/auth/sign-out";
import UserAvatar from "@/components/ui/UserAvatar";

type AdminUserMenuProps = {
  name: string;
};

export default function AdminUserMenu({ name }: AdminUserMenuProps) {
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
        className="nb-chip flex items-center gap-2.5 py-1 pl-1 pr-2.5 transition hover:-translate-y-0.5"
      >
        <UserAvatar name={name} className="h-9 w-9 text-sm" />
        <div className="hidden text-left sm:block">
          <p className="text-sm font-bold" style={{ color: "var(--sb-ink)" }}>{name}</p>
          <p className="text-xs font-semibold" style={{ color: "var(--sb-teal-dark)" }}>Admin</p>
        </div>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--sb-muted)" }} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl"
        >
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