"use client";

import { useState } from "react";
import { Repeat, MessageCircle } from "lucide-react";

type PublicProfileActionsProps = {
  fullname: string;
};

/**
 * FR-005 (Send Swap Request) / FR-006 (Message) — the session-request and
 * messaging flows aren't built yet, so these are placeholders that give
 * feedback instead of silently doing nothing.
 */
export default function PublicProfileActions({ fullname }: PublicProfileActionsProps) {
  const [notice, setNotice] = useState("");

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setNotice(`Sending swap requests isn't available yet — coming soon!`)}
        className="btn-pill flex w-full items-center justify-center gap-2 bg-brand py-3 text-sm text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
      >
        <Repeat size={16} />
        Send Swap Request
      </button>
      <button
        type="button"
        onClick={() => setNotice(`Messaging isn't available yet — coming soon!`)}
        className="btn-pill flex w-full items-center justify-center gap-2 border-2 border-slate-200 py-3 text-sm text-slate-700 hover:border-brand/40 hover:text-brand"
      >
        <MessageCircle size={16} />
        Message {fullname.split(" ")[0]}
      </button>
      {notice && <p className="text-center text-xs font-medium text-slate-500">{notice}</p>}
    </div>
  );
}
