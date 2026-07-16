"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ADMIN_NAV_ITEMS, isAdminNavActive } from "@/lib/admin-nav";
import AdminUserMenu from "./AdminUserMenu";

type AdminTopbarProps = {
  userName: string;
};

export default function AdminTopbar({ userName }: AdminTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-30 shrink-0 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:justify-end lg:px-10 lg:py-3">
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <button
            type="button"
            aria-label="Open admin navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link href="/dashboard/admin" className="inline-flex min-w-0 items-center gap-2">
            <Image src="/images/logo-mark.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
            <span className="truncate text-base font-extrabold text-brand">SkillBridge Admin</span>
          </Link>
        </div>

        <AdminUserMenu name={userName} />
      </div>

      {menuOpen && (
        <nav className="space-y-1 border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isAdminNavActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-brand-light text-brand" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}