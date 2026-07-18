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
      style={{ boxShadow: "var(--sb-shadow-md)" }}
    >
      <div
        className={`min-w-0 shrink-0 ${
          isThreadOpen ? "hidden md:flex" : "flex"
        } w-full flex-col md:w-[22rem]`}
        style={{ borderRight: "1px solid #eef7f0" }}
      >
        {list}
      </div>
      <div className={`min-w-0 flex-1 flex-col ${isThreadOpen ? "flex" : "hidden md:flex"}`}>
        {children}
      </div>
    </div>
  );
}
