"use client";

import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function AdminMessagesIndexPage() {
  const { dictionary } = useLocale();
  const m = dictionary.messages;

  return (
    <div className="sb-chat-wallpaper flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white"
        style={{ boxShadow: "var(--sb-shadow-sm)", color: "var(--sb-teal-dark)" }}
      >
        <MessageSquare size={28} />
      </div>
      <h2 className="text-base font-semibold nb-heading" style={{ color: "var(--sb-ink)" }}>
        {m.selectConversation}
      </h2>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed" style={{ color: "var(--sb-muted)" }}>
        {m.selectConversationHint}
      </p>
      <Link
        href="/dashboard/admin/browse-people"
        className="nb-btn mt-5 px-4 py-2 text-sm text-white"
        style={{ background: "var(--sb-gradient)" }}
      >
        {m.browsePeople}
      </Link>
    </div>
  );
}