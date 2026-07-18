"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** On small screens show either the thread list or the chat — not both. */
export default function MessagesShell({
  list,
  children,
}: {
  list: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isThreadOpen = pathname.startsWith("/dashboard/messages/") && pathname !== "/dashboard/messages";

  return (
    <div
      className="mt-2 flex h-[calc(100dvh-11.5rem)] overflow-hidden rounded-2xl bg-white sm:mt-4 sm:h-[calc(100dvh-12rem)] lg:h-[calc(100vh-9rem)]"
      style={{ border: "2.5px solid var(--neu-ink)", boxShadow: "6px 6px 0 var(--neu-ink)" }}
    >
      <div
        className={`min-w-0 shrink-0 ${
          isThreadOpen ? "hidden md:flex" : "flex"
        } w-full flex-col md:w-[22rem]`}
        style={{ borderRight: "2.5px solid var(--neu-ink)" }}
      >
        {list}
      </div>
      <div className={`min-w-0 flex-1 flex-col bg-[#fbf9ff] ${isThreadOpen ? "flex" : "hidden md:flex"}`}>
        {children}
      </div>
    </div>
  );
}
