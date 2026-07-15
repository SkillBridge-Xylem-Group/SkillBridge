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
} from "lucide-react";
import { useSwapWebRtc } from "@/hooks/useSwapWebRtc";
import { completeSessionAction } from "@/lib/actions/sessionRequests";
import type { SwapSessionRoomData } from "@/lib/swapSession";

type Props = {
  session: SwapSessionRoomData;
  userId: string;
  viewerName: string;
};

function statusLabel(
  connectionState: ReturnType<typeof useSwapWebRtc>["connectionState"],
  partnerPresent: boolean,
  mediaError: string | null
) {
  if (mediaError) return mediaError;
  switch (connectionState) {
    case "connecting":
      return "Starting camera and microphone…";
    case "waiting":
      return partnerPresent
        ? "Partner joined — connecting…"
        : "Waiting for your partner to join…";
    case "connecting-peer":
      return "Connecting to your partner…";
    case "connected":
      return "Connected — you are live";
    case "failed":
      return "Connection failed. Ask your partner to rejoin, or try again.";
    case "ended":
      return "Call ended";
    default:
      return "";
  }
}

export default function SwapSessionRoom({ session, userId, viewerName }: Props) {
  const router = useRouter();
  const [isCompleting, startComplete] = useTransition();
  const {
    localVideoRef,
    remoteVideoRef,
    connectionState,
    mediaError,
    micEnabled,
    cameraEnabled,
    partnerPresent,
    toggleMic,
    toggleCamera,
    hangUp,
  } = useSwapWebRtc({ requestId: session.requestId, userId });

  const topic = session.topic?.skill_name ?? "Skill swap";
  const label = statusLabel(connectionState, partnerPresent, mediaError);

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
    <div className="flex min-h-[calc(100vh-5rem)] flex-col gap-4 pb-20 lg:pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard/swap-requests"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            Back to requests
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Skill Swap Session</h1>
          <p className="mt-1 text-sm text-slate-600">
            {topic}
            {session.topic?.category ? ` · ${session.topic.category}` : ""} with{" "}
            <span className="font-semibold text-slate-800">{session.partner.fullname}</span>
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
          {connectionState === "connected" ? (
            <span className="inline-flex items-center gap-2 text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              {(connectionState === "connecting" || connectionState === "connecting-peer") && (
                <Loader2 size={14} className="animate-spin" />
              )}
              {partnerPresent ? "Partner in room" : "You are in the room"}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-500">{label}</p>

      <div className="relative grid flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="relative min-h-[240px] overflow-hidden rounded-2xl bg-slate-900 shadow-sm lg:min-h-[420px]">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          {connectionState !== "connected" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/90 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
                {session.partner.fullname
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p.charAt(0).toUpperCase())
                  .join("")}
              </div>
              <p className="text-sm font-semibold text-white">{session.partner.fullname}</p>
              <p className="text-xs text-slate-300">
                {partnerPresent ? "Connecting audio & video…" : "Share this session — waiting for them to join."}
              </p>
            </div>
          )}
          <span className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-xs font-semibold text-white">
            {session.partner.fullname}
          </span>
        </div>

        <div className="relative min-h-[200px] overflow-hidden rounded-2xl bg-slate-800 shadow-sm lg:min-h-[420px]">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover ${cameraEnabled ? "" : "opacity-0"}`}
          />
          {!cameraEnabled && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                {viewerName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p.charAt(0).toUpperCase())
                  .join("") || "You"}
              </div>
            </div>
          )}
          <span className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-xs font-semibold text-white">
            You {!micEnabled ? "· Mic off" : ""}
          </span>
        </div>
      </div>

      <div className="sticky bottom-16 z-10 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:bottom-4">
        <button
          type="button"
          onClick={toggleMic}
          className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${
            micEnabled
              ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
          aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
          title={micEnabled ? "Mute" : "Unmute"}
        >
          {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button
          type="button"
          onClick={toggleCamera}
          className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${
            cameraEnabled
              ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
          aria-label={cameraEnabled ? "Turn camera off" : "Turn camera on"}
          title={cameraEnabled ? "Camera off" : "Camera on"}
        >
          {cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button
          type="button"
          onClick={() => void leave()}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700"
        >
          <PhoneOff size={18} />
          Leave
        </button>
        <button
          type="button"
          disabled={isCompleting}
          onClick={markComplete}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          <CheckCircle2 size={18} />
          {isCompleting ? "Finishing…" : "Mark Complete"}
        </button>
      </div>
    </div>
  );
}
