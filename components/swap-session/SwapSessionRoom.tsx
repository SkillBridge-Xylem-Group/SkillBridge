"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useSwapWebRtc } from "@/hooks/useSwapWebRtc";
import { completeSessionAction } from "@/lib/actions/sessionRequests";
import type { SwapSessionRoomData } from "@/lib/swapSession";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import SessionChat from "./SessionChat";

type Props = {
  session: SwapSessionRoomData;
  userId: string;
  viewerName: string;
};

function statusLabel(
  connectionState: ReturnType<typeof useSwapWebRtc>["connectionState"],
  partnerPresent: boolean,
  s: Dictionary["swapSession"]
) {
  switch (connectionState) {
    case "connecting":
      return s.statusJoining;
    case "waiting":
      return partnerPresent ? s.statusPartnerJoinedConnecting : s.statusWaitingPartner;
    case "connecting-peer":
      return s.statusConnectingPeer;
    case "connected":
      return s.statusConnected;
    case "failed":
      return s.statusFailed;
    case "ended":
      return s.statusEnded;
    default:
      return "";
  }
}

export default function SwapSessionRoom({ session, userId, viewerName }: Props) {
  const router = useRouter();
  const { dictionary } = useLocale();
  const s = dictionary.swapSession;
  const [isCompleting, startComplete] = useTransition();
  const {
    bindLocalVideo,
    bindRemoteVideo,
    connectionState,
    mediaError,
    mediaWarning,
    mediaReady,
    mediaBusy,
    micEnabled,
    cameraEnabled,
    hasMic,
    hasCamera,
    partnerPresent,
    messages,
    toggleMic,
    toggleCamera,
    enableDevices,
    sendChat,
    sendChatFile,
    hangUp,
  } = useSwapWebRtc({ requestId: session.requestId, userId, userName: viewerName });

  const topic = session.topic?.skill_name ?? s.defaultTopic;
  const label = statusLabel(connectionState, partnerPresent, s);
  const roomOpen = connectionState !== "ended";

  async function leave() {
    await hangUp();
    router.push("/dashboard/swap-requests");
  }

  function markComplete() {
    startComplete(async () => {
      await hangUp();
      await completeSessionAction(session.requestId);
      router.push("/dashboard/swap-requests");
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col gap-4 pb-24 lg:pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard/swap-requests"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            {s.backToRequests}
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">{s.roomTitle}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {topic}
            {session.topic?.category ? ` · ${session.topic.category}` : ""} {s.withLabel}{" "}
            <span className="font-semibold text-slate-800">{session.partner.fullname}</span>
          </p>
        </div>
        {(connectionState === "connected" ||
          connectionState === "connecting" ||
          connectionState === "connecting-peer" ||
          partnerPresent) && (
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
            {connectionState === "connected" ? (
              <span className="inline-flex items-center gap-2 text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                {s.live}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                {(connectionState === "connecting" || connectionState === "connecting-peer") && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                {partnerPresent ? s.partnerInRoom : null}
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-slate-500">{label}</p>
      {mediaWarning && <p className="text-sm text-amber-700">{mediaWarning}</p>}
      {mediaError && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="min-w-0 flex-1">{mediaError}</p>
          <button
            type="button"
            disabled={mediaBusy}
            onClick={() => void enableDevices()}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100 disabled:opacity-50"
          >
            {mediaBusy ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {s.enableDevices}
          </button>
        </div>
      )}

      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,34%)_minmax(0,66%)]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900 shadow-sm xl:aspect-auto xl:min-h-[150px] xl:max-h-[200px]">
              <video
                ref={bindRemoteVideo}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
              {connectionState !== "connected" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-900/90 px-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {session.partner.fullname
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p.charAt(0).toUpperCase())
                      .join("")}
                  </div>
                  <p className="text-xs font-semibold text-white">{session.partner.fullname}</p>
                  <p className="text-[11px] text-slate-300">
                    {partnerPresent ? s.connecting : s.waitingForThemToJoin}
                  </p>
                </div>
              )}
              <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
                {session.partner.fullname}
              </span>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-800 shadow-sm xl:aspect-auto xl:min-h-[120px] xl:max-h-[160px]">
              <video
                ref={bindLocalVideo}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${cameraEnabled && hasCamera ? "" : "opacity-0"}`}
              />
              {(!hasCamera || !cameraEnabled) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {viewerName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p.charAt(0).toUpperCase())
                      .join("") || "You"}
                  </div>
                  {!mediaReady && (
                    <button
                      type="button"
                      disabled={mediaBusy}
                      onClick={() => void enableDevices()}
                      className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/25 disabled:opacity-50"
                    >
                      {mediaBusy ? s.requesting : s.enableCameraMic}
                    </button>
                  )}
                </div>
              )}
              <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
                {s.you}
                {hasMic && !micEnabled ? ` · ${s.micOff}` : ""}
                {hasCamera && !cameraEnabled ? ` · ${s.camOff}` : ""}
              </span>
            </div>
          </div>

          <div className="sticky bottom-16 z-10 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:static lg:bottom-auto">
            <button
              type="button"
              onClick={() => void toggleMic()}
              disabled={mediaBusy}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${
                !hasMic
                  ? "bg-slate-200 text-slate-500 hover:bg-slate-300"
                  : micEnabled
                    ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    : "bg-red-500 text-white hover:bg-red-600"
              }`}
              aria-label={!hasMic ? s.enableMic : micEnabled ? s.muteMic : s.unmuteMic}
              title={!hasMic ? s.enableMic : micEnabled ? s.mute : s.unmute}
            >
              {hasMic && micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button
              type="button"
              onClick={() => void toggleCamera()}
              disabled={mediaBusy}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${
                !hasCamera
                  ? "bg-slate-200 text-slate-500"
                  : cameraEnabled
                    ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    : "bg-red-500 text-white hover:bg-red-600"
              }`}
              aria-label={
                !hasCamera ? s.enableCamera : cameraEnabled ? s.turnCameraOff : s.turnCameraOn
              }
              title={!hasCamera ? s.enableCamera : cameraEnabled ? s.cameraOff : s.cameraOn}
            >
              {hasCamera && cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            {!mediaReady && (
              <button
                type="button"
                disabled={mediaBusy}
                onClick={() => void enableDevices()}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {mediaBusy ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {s.enableDevices}
              </button>
            )}
            <button
              type="button"
              onClick={() => void leave()}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700"
            >
              <PhoneOff size={18} />
              {s.leave}
            </button>
            <button
              type="button"
              disabled={isCompleting}
              onClick={markComplete}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              <CheckCircle2 size={18} />
              {isCompleting ? s.finishingUp : s.markComplete}
            </button>
          </div>
        </div>

        <div className="min-h-[480px] xl:min-h-[560px]">
          <SessionChat
            messages={messages}
            userId={userId}
            partnerName={session.partner.fullname}
            onSend={sendChat}
            onSendFile={sendChatFile}
            disabled={!roomOpen}
          />
        </div>
      </div>
    </div>
  );
}
