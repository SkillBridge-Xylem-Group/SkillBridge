"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    <div className="sticky top-0 z-30 flex shrink-0 flex-col bg-white lg:mb-2 lg:bg-transparent">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:justify-end lg:px-0 lg:py-4">
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <button
            type="button"
            aria-label="Open admin navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="nb-icon-btn flex h-9 w-9 shrink-0 items-center justify-center"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/dashboard/admin" className="inline-flex min-w-0 items-center gap-2">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl">
              <Image src="/images/logo-mark.png" alt="SkillBridge" fill sizes="32px" className="object-cover" />
            </span>
            <span className="truncate text-base font-extrabold nb-heading">SkillBridge Admin</span>
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