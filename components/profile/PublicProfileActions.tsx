"use client";

import { useState, useTransition } from "react";
import { Repeat, MessageCircle, Check } from "lucide-react";
import { sendSwapRequestAction } from "@/lib/actions/sessionRequests";

type PublicProfileActionsProps = {
  fullname: string;
  profileId: string;
};

export default function PublicProfileActions({ fullname, profileId }: PublicProfileActionsProps) {
  const [notice, setNotice] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSendRequest() {
    startTransition(async () => {
      const result = await sendSwapRequestAction(profileId);
      if (result?.error) {
        setNotice(result.error);
      } else {
        setSent(true);
        setNotice("Swap request sent — check My Swap Requests to track it.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSendRequest}
        disabled={isPending || sent}
        className="btn-pill flex w-full items-center justify-center gap-2 bg-brand py-3 text-sm text-white shadow-lg shadow-brand/30 hover:bg-brand-dark disabled:opacity-60"
      >
        {sent ? <Check size={16} /> : <Repeat size={16} />}
        {sent ? "Request Sent" : isPending ? "Sending..." : "Send Swap Request"}
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