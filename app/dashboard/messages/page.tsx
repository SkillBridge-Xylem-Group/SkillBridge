import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default function MessagesIndexPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand shadow-sm ring-1 ring-slate-100">
        <MessageSquare size={28} />
      </div>
      <h2 className="text-base font-semibold text-slate-900">Select a conversation</h2>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">
        Pick someone from the left to keep chatting, or find a new partner to message.
      </p>
      <Link
        href="/dashboard/browse-people"
        className="mt-5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand/30 hover:text-brand active:scale-95"
      >
        Browse people
      </Link>
    </div>
  );
}
