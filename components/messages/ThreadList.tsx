"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getInitials } from "@/lib/utils";
import type { ThreadSummary } from "@/lib/messages";

export default function ThreadList({ threads }: { threads: ThreadSummary[] }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto border-r border-slate-100">
      <div className="border-b border-slate-100 p-4">
        <h1 className="text-lg font-extrabold text-slate-900">Messages</h1>
      </div>

      {threads.length === 0 ? (
        <p className="p-4 text-sm text-slate-500">
          No conversations yet — visit someone&apos;s profile and hit Message to start one.
        </p>
      ) : (
        <ul>
          {threads.map((t) => {
            const active = pathname === `/dashboard/messages/${t.partner.slug}`;
            return (
              <li key={t.thread_id}>
                <Link
                  href={`/dashboard/messages/${t.partner.slug}`}
                  className={`flex items-center gap-3 border-b border-slate-50 p-4 hover:bg-slate-50 ${
                    active ? "bg-brand-light" : ""
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
                    {getInitials(t.partner.fullname)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{t.partner.fullname}</p>
                    <p className="truncate text-xs text-slate-500">{t.lastMessage?.content ?? "Say hello!"}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
