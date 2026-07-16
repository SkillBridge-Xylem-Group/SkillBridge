"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS, isAdminNavActive } from "@/lib/admin-nav";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col justify-between border-r border-slate-100 bg-white px-6 py-8 lg:flex">
      <div>
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2">
          <Image
            src="/images/logo-mark.png"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0"
          />
          <span className="text-xl font-extrabold text-brand">SkillBridge</span>
        </Link>
        <p className="mt-1 pl-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Admin Console
        </p>
        <nav className="mt-8 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isAdminNavActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-brand-light text-brand" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}