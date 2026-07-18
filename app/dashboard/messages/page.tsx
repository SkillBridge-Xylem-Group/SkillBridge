import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default function MessagesIndexPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white"
        style={{ border: "2px solid var(--neu-ink)", color: "var(--neu-indigo)" }}
      >
        <MessageSquare size={28} />
      </div>
      <h2 className="text-base font-semibold nb-heading" style={{ color: "var(--neu-ink)" }}>Select a conversation</h2>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed" style={{ color: "var(--neu-text-muted)" }}>
        Pick someone from the left to keep chatting, or find a new partner to message.
      </p>
      <Link href="/dashboard/browse-people" className="nb-btn mt-5 bg-white px-4 py-2 text-sm" style={{ color: "var(--neu-ink)" }}>
        Browse people
      </Link>
    </div>
  );
}
