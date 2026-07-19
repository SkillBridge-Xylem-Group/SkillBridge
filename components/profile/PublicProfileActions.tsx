"use client";

import { useState, useTransition } from "react";
import { Repeat, MessageCircle, Check } from "lucide-react";
import { sendSwapRequestAction } from "@/lib/actions/sessionRequests";
import { startThreadAction } from "@/lib/actions/messages";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";

type PublicProfileActionsProps = {
  fullname: string;
  profileId: string;
};

export default function PublicProfileActions({ fullname, profileId }: PublicProfileActionsProps) {
  const { dictionary } = useLocale();
  const p = dictionary.profile;
  const [notice, setNotice] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isMessaging, startMessageTransition] = useTransition();

  function handleSendRequest() {
    startTransition(async () => {
      const result = await sendSwapRequestAction(profileId);
      if (result?.error) {
        setNotice(result.error);
      } else {
        setSent(true);
        setNotice(p.swapRequestSentNotice);
      }
    });
  }

  function handleMessage() {
    startMessageTransition(async () => {
      const result = await startThreadAction(profileId);
      if (result?.error) {
        setNotice(result.error);
      }
    });
  }

  const firstName = fullname.split(" ")[0] || fullname;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSendRequest}
        disabled={isPending || sent}
        className="nb-btn flex w-full items-center justify-center gap-2 py-3 text-sm text-white disabled:opacity-60"
        style={{ background: "var(--sb-gradient)" }}
      >
        {sent ? <Check size={16} /> : <Repeat size={16} />}
        {sent ? p.requestSent : isPending ? p.sending : p.sendSwapRequest}
      </button>
      <button
        type="button"
        onClick={handleMessage}
        disabled={isMessaging}
        className="nb-btn flex w-full items-center justify-center gap-2 bg-white py-3 text-sm disabled:opacity-60"
        style={{ color: "var(--sb-ink)" }}
      >
        <MessageCircle size={16} />
        {isMessaging ? p.opening : interpolate(p.messageUser, { name: firstName })}
      </button>
      {notice && <p className="text-center text-xs font-medium" style={{ color: "var(--sb-muted)" }}>{notice}</p>}
    </div>
  );
}
