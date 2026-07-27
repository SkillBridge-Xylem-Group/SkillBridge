"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadSessionChatFile } from "@/lib/swapSessionChatUpload";

type SignalPayload =
  | { type: "offer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; from: string; candidate: RTCIceCandidateInit }
  | { type: "hangup"; from: string }
  | { type: "session-complete"; from: string };

export type ChatAttachment = {
  name: string;
  mime: string;
  size: number;
  /** Signed Storage URL (or legacy data URL). */
  url: string;
};

export type ChatMessage = {
  id: string;
  from: string;
  fromName: string;
  text: string;
  at: number;
  attachment?: ChatAttachment;
};

export type ConnectionState = "connecting" | "waiting" | "connecting-peer" | "connected" | "failed" | "ended";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

type Options = {
  requestId: string;
  userId: string;
  userName: string;
};

function mediaErrorMessage(err: unknown): string {
  if (!window.isSecureContext) {
    return "Camera and microphone need a secure page (https or localhost). Open the app via https or http://localhost.";
  }
  const name = err && typeof err === "object" && "name" in err ? String((err as { name: string }).name) : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Permission denied. Allow camera and microphone for this site in your browser settings, then tap Enable devices.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera or microphone was found on this device.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "Camera or microphone is already in use by another app. Close it and try again.";
  }
  return "Could not access camera or microphone. Check browser permissions and try again.";
}

async function acquireMedia(): Promise<{ stream: MediaStream; warning: string | null }> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("MediaDevices API unavailable");
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    return { stream, warning: null };
  } catch (videoErr) {
    // Fall back to audio-only so mic still works when camera is blocked/missing.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      return {
        stream,
        warning: "Camera unavailable — microphone is on. You can still chat in text.",
      };
    } catch {
      throw videoErr;
    }
  }
}

export function useSwapWebRtc({ requestId, userId, userName }: Options) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaWarning, setMediaWarning] = useState<string | null>(null);
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [partnerPresent, setPartnerPresent] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [partnerCompletedSession, setPartnerCompletedSession] = useState(false);

  const localVideoEl = useRef<HTMLVideoElement | null>(null);
  const remoteVideoEl = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const isPoliteRef = useRef(false);
  const offerStartedRef = useRef(false);
  const endedRef = useRef(false);
  const partnerIdRef = useRef<string | null>(null);
  const [remoteHasVideo, setRemoteHasVideo] = useState(false);
  const [remoteCameraEnabled, setRemoteCameraEnabled] = useState(false);

  const syncRemoteTrackFlags = useCallback((stream: MediaStream | null) => {
    const video = stream?.getVideoTracks().find((t) => t.readyState !== "ended") ?? null;
    setRemoteHasVideo(Boolean(video));
    setRemoteCameraEnabled(Boolean(video?.enabled && video.readyState === "live"));
  }, []);

  const watchRemoteVideoTrack = useCallback(
    (track: MediaStreamTrack) => {
      if (track.kind !== "video") return;
      const sync = () => syncRemoteTrackFlags(remoteStreamRef.current);
      track.onmute = sync;
      track.onunmute = sync;
      track.onended = sync;
      sync();
    },
    [syncRemoteTrackFlags]
  );

  const bindLocalVideo = useCallback((el: HTMLVideoElement | null) => {
    localVideoEl.current = el;
    if (el && localStreamRef.current) {
      el.srcObject = localStreamRef.current;
      void el.play().catch(() => undefined);
    }
  }, []);

  const bindRemoteVideo = useCallback((el: HTMLVideoElement | null) => {
    remoteVideoEl.current = el;
    if (el && remoteStreamRef.current) {
      el.srcObject = remoteStreamRef.current;
      void el.play().catch(() => undefined);
    }
  }, []);

  const syncLocalPreview = useCallback(() => {
    const el = localVideoEl.current;
    const stream = localStreamRef.current;
    if (!el) return;
    if (el.srcObject !== stream) el.srcObject = stream;
    void el.play().catch(() => undefined);
  }, []);

  const syncTrackFlags = useCallback((stream: MediaStream | null) => {
    const audio = stream?.getAudioTracks()[0] ?? null;
    const video = stream?.getVideoTracks()[0] ?? null;
    setHasMic(Boolean(audio));
    setHasCamera(Boolean(video));
    setMicEnabled(Boolean(audio?.enabled));
    setCameraEnabled(Boolean(video?.enabled));
    setMediaReady(Boolean(audio || video));
  }, []);

  const pushTracksToPeer = useCallback((stream: MediaStream) => {
    const pc = pcRef.current;
    if (!pc) return;

    for (const track of stream.getTracks()) {
      const sender = pc.getSenders().find((s) => s.track?.kind === track.kind);
      if (sender) {
        void sender.replaceTrack(track);
      } else {
        pc.addTrack(track, stream);
      }
    }
  }, []);

  const applyLocalStream = useCallback(
    (stream: MediaStream, warning: string | null) => {
      const prev = localStreamRef.current;
      if (prev && prev !== stream) {
        prev.getTracks().forEach((t) => t.stop());
      }
      localStreamRef.current = stream;
      syncLocalPreview();
      syncTrackFlags(stream);
      setMediaError(null);
      setMediaWarning(warning);
      pushTracksToPeer(stream);

      // Renegotiate if we already have a peer and just gained media.
      if (pcRef.current && partnerIdRef.current && userId < partnerIdRef.current) {
        offerStartedRef.current = false;
      }
    },
    [pushTracksToPeer, syncLocalPreview, syncTrackFlags, userId]
  );

  const enableDevices = useCallback(async () => {
    setMediaBusy(true);
    try {
      const { stream, warning } = await acquireMedia();
      applyLocalStream(stream, warning);

      const pc = pcRef.current;
      if (pc && partnerIdRef.current) {
        if (userId < partnerIdRef.current) {
          offerStartedRef.current = false;
          makingOfferRef.current = true;
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            if (pc.localDescription) {
              await channelRef.current?.send({
                type: "broadcast",
                event: "signal",
                payload: { type: "offer", from: userId, sdp: pc.localDescription } satisfies SignalPayload,
              });
            }
          } finally {
            makingOfferRef.current = false;
          }
        }
      }
    } catch (err) {
      console.error("[swap-webrtc] enableDevices failed:", err);
      setMediaError(mediaErrorMessage(err));
      syncTrackFlags(localStreamRef.current);
    } finally {
      setMediaBusy(false);
    }
  }, [applyLocalStream, syncTrackFlags, userId]);

  useEffect(() => {
    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    endedRef.current = false;
    offerStartedRef.current = false;

    async function sendSignal(payload: SignalPayload) {
      const ch = channelRef.current;
      if (!ch) return;
      await ch.send({ type: "broadcast", event: "signal", payload });
    }

    function resetPeer() {
      pcRef.current?.close();
      pcRef.current = null;
      offerStartedRef.current = false;
      remoteStreamRef.current = null;
      if (remoteVideoEl.current) remoteVideoEl.current.srcObject = null;
      syncRemoteTrackFlags(null);
    }

    function ensurePeerConnection() {
      if (pcRef.current) return pcRef.current;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      const local = localStreamRef.current;
      if (local) {
        for (const track of local.getTracks()) {
          pc.addTrack(track, local);
        }
      }

      const remote = new MediaStream();
      remoteStreamRef.current = remote;
      if (remoteVideoEl.current) {
        remoteVideoEl.current.srcObject = remote;
        void remoteVideoEl.current.play().catch(() => undefined);
      }

      pc.ontrack = (event) => {
        const inbound = event.streams[0];
        if (inbound) {
          for (const track of inbound.getTracks()) {
            if (!remote.getTracks().some((t) => t.id === track.id)) {
              remote.addTrack(track);
            }
            if (track.kind === "video") watchRemoteVideoTrack(track);
          }
        } else if (!remote.getTracks().some((t) => t.id === event.track.id)) {
          remote.addTrack(event.track);
          if (event.track.kind === "video") watchRemoteVideoTrack(event.track);
        }
        remoteStreamRef.current = remote;
        syncRemoteTrackFlags(remote);
        if (remoteVideoEl.current) {
          remoteVideoEl.current.srcObject = remote;
          void remoteVideoEl.current.play().catch(() => undefined);
        }
        setConnectionState("connected");
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        void sendSignal({ type: "ice", from: userId, candidate: event.candidate.toJSON() });
      };

      pc.onconnectionstatechange = () => {
        if (endedRef.current) return;
        const state = pc.connectionState;
        if (state === "connected") setConnectionState("connected");
        else if (state === "failed") setConnectionState("failed");
        else if (state === "disconnected") setConnectionState("waiting");
      };

      return pc;
    }

    async function makeOffer() {
      if (offerStartedRef.current || endedRef.current) return;
      offerStartedRef.current = true;
      const pc = ensurePeerConnection();
      try {
        makingOfferRef.current = true;
        setConnectionState("connecting-peer");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (pc.localDescription) {
          await sendSignal({ type: "offer", from: userId, sdp: pc.localDescription });
        }
      } catch (err) {
        console.error("[swap-webrtc] offer failed:", err);
        offerStartedRef.current = false;
        setConnectionState("failed");
      } finally {
        makingOfferRef.current = false;
      }
    }

    async function handleSignal(payload: SignalPayload) {
      if (payload.from === userId || endedRef.current) return;

      if (payload.type === "session-complete") {
        endedRef.current = true;
        setPartnerCompletedSession(true);
        resetPeer();
        setConnectionState("ended");
        return;
      }

      if (payload.type === "hangup") {
        resetPeer();
        setConnectionState("waiting");
        return;
      }

      const pc = ensurePeerConnection();

      try {
        if (payload.type === "offer") {
          const offerCollision = makingOfferRef.current || pc.signalingState !== "stable";
          ignoreOfferRef.current = !isPoliteRef.current && offerCollision;
          if (ignoreOfferRef.current) return;

          setConnectionState("connecting-peer");
          await pc.setRemoteDescription(payload.sdp);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          if (pc.localDescription) {
            await sendSignal({ type: "answer", from: userId, sdp: pc.localDescription });
          }
        } else if (payload.type === "answer") {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(payload.sdp);
          }
        } else if (payload.type === "ice") {
          try {
            await pc.addIceCandidate(payload.candidate);
          } catch (err) {
            if (!ignoreOfferRef.current) throw err;
          }
        }
      } catch (err) {
        console.error("[swap-webrtc] signal handling failed:", err);
        setConnectionState("failed");
      }
    }

    async function start() {
      setConnectionState("connecting");

      // Media first (best effort) — room still opens if devices fail.
      try {
        const { stream, warning } = await acquireMedia();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        applyLocalStream(stream, warning);
      } catch (err) {
        console.error("[swap-webrtc] getUserMedia failed:", err);
        if (!cancelled) {
          setMediaError(mediaErrorMessage(err));
          setMediaReady(false);
          setHasMic(false);
          setHasCamera(false);
          setMicEnabled(false);
          setCameraEnabled(false);
        }
      }

      if (cancelled) return;

      const channelRes = await fetch(`/api/swap-session/${requestId}/channel`, { method: "POST" });
      if (!channelRes.ok) {
        if (!cancelled) {
          setConnectionState("failed");
          setMediaError("Could not authorize this session channel. Refresh and try again.");
        }
        return;
      }
      const channelPayload = (await channelRes.json()) as { channel?: string };
      const channelTopic = channelPayload.channel;
      if (!channelTopic) {
        if (!cancelled) {
          setConnectionState("failed");
          setMediaError("Could not authorize this session channel. Refresh and try again.");
        }
        return;
      }

      const supabase = createSupabaseBrowserClient();
      channel = supabase.channel(channelTopic, {
        config: {
          broadcast: { self: false },
          presence: { key: userId },
        },
      });
      channelRef.current = channel;

      channel.on("broadcast", { event: "signal" }, ({ payload }) => {
        void handleSignal(payload as SignalPayload);
      });

      channel.on("broadcast", { event: "chat" }, ({ payload }) => {
        const msg = payload as ChatMessage;
        if (!msg?.id || (!msg.text && !msg.attachment)) return;
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      });

      channel.on("presence", { event: "sync" }, () => {
        if (endedRef.current) return;
        const state = channel?.presenceState() ?? {};
        const peers = Object.keys(state);
        const others = peers.filter((id) => id !== userId);
        setPartnerPresent(others.length > 0);

        if (others.length === 0) {
          partnerIdRef.current = null;
          resetPeer();
          setConnectionState("waiting");
          return;
        }

        const partnerId = others[0];
        partnerIdRef.current = partnerId;
        isPoliteRef.current = userId > partnerId;

        if (userId < partnerId) {
          void makeOffer();
        } else {
          ensurePeerConnection();
          setConnectionState((prev) => (prev === "connected" ? prev : "connecting-peer"));
        }
      });

      const status = await new Promise<string>((resolve) => {
        channel!.subscribe((s) => {
          if (s === "SUBSCRIBED" || s === "CHANNEL_ERROR" || s === "TIMED_OUT") resolve(s);
        });
      });

      if (cancelled) return;

      if (status !== "SUBSCRIBED") {
        setMediaError((prev) => prev ?? "Could not join the session room. Check your connection and try again.");
        setConnectionState("failed");
        return;
      }

      await channel.track({ userId, joinedAt: Date.now() });
      setConnectionState("waiting");
    }

    void start();

    return () => {
      cancelled = true;
      endedRef.current = true;
      void channelRef.current?.send({
        type: "broadcast",
        event: "signal",
        payload: { type: "hangup", from: userId } satisfies SignalPayload,
      });
      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      remoteStreamRef.current = null;
      if (channel) {
        const supabase = createSupabaseBrowserClient();
        void supabase.removeChannel(channel);
      }
      channelRef.current = null;
    };
    // applyLocalStream is stable enough via refs; omit to avoid reconnect loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, userId]);

  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) {
      void enableDevices();
      return;
    }
    track.enabled = !track.enabled;
    setMicEnabled(track.enabled);
  }, [enableDevices]);

  const toggleCamera = useCallback(async () => {
    const stream = localStreamRef.current;
    const track = stream?.getVideoTracks().find((t) => t.readyState === "live");

    if (track) {
      track.enabled = !track.enabled;
      setCameraEnabled(track.enabled);
      syncLocalPreview();
      return;
    }

    // No live camera track — request one and merge into the current stream.
    setMediaBusy(true);
    try {
      const videoOnly = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      const videoTrack = videoOnly.getVideoTracks()[0];
      if (!videoTrack) throw new Error("No video track");

      if (stream) {
        const stale = stream.getVideoTracks();
        for (const t of stale) {
          stream.removeTrack(t);
          t.stop();
        }
        stream.addTrack(videoTrack);
        applyLocalStream(stream, null);
      } else {
        applyLocalStream(videoOnly, null);
      }
    } catch (err) {
      console.error("[swap-webrtc] camera enable failed:", err);
      setMediaError(mediaErrorMessage(err));
    } finally {
      setMediaBusy(false);
    }
  }, [applyLocalStream, syncLocalPreview]);

  const publishChat = useCallback(
    async (msg: ChatMessage) => {
      if (!channelRef.current) return false;
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      await channelRef.current.send({
        type: "broadcast",
        event: "chat",
        payload: msg,
      });
      return true;
    },
    []
  );

  const sendChat = useCallback(
    async (text: string, attachment?: ChatAttachment) => {
      const trimmed = text.trim();
      if ((!trimmed && !attachment) || !channelRef.current) return false;

      const msg: ChatMessage = {
        id: `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        from: userId,
        fromName: userName,
        text: trimmed.slice(0, 2000),
        at: Date.now(),
        attachment,
      };

      return publishChat(msg);
    },
    [publishChat, userId, userName]
  );

  const sendChatFile = useCallback(
    async (file: File, caption = "") => {
      if (!channelRef.current) return { ok: false as const, error: "Chat is not connected." };

      const uploaded = await uploadSessionChatFile({ requestId, userId, file });
      if (!uploaded.ok) return uploaded;

      const ok = await sendChat(caption, uploaded.attachment);
      return ok
        ? { ok: true as const }
        : { ok: false as const, error: "Could not send the file. Try again." };
    },
    [requestId, sendChat, userId]
  );

  // Distinct from hangUp() — tells the partner the session was marked
  // complete (not just that this side disconnected), so their room shows
  // a clear "session complete" state instead of "waiting to reconnect".
  const notifySessionComplete = useCallback(async () => {
    await channelRef.current?.send({
      type: "broadcast",
      event: "signal",
      payload: { type: "session-complete", from: userId } satisfies SignalPayload,
    });
  }, [userId]);

  const hangUp = useCallback(async () => {
    endedRef.current = true;
    setConnectionState("ended");
    await channelRef.current?.send({
      type: "broadcast",
      event: "signal",
      payload: { type: "hangup", from: userId } satisfies SignalPayload,
    });
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    if (localVideoEl.current) localVideoEl.current.srcObject = null;
    if (remoteVideoEl.current) remoteVideoEl.current.srcObject = null;
    setMediaReady(false);
    setHasMic(false);
    setHasCamera(false);
    setMicEnabled(false);
    setCameraEnabled(false);
  }, [userId]);

  return {
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
    remoteHasVideo,
    remoteCameraEnabled,
    messages,
    toggleMic,
    toggleCamera,
    enableDevices,
    sendChat,
    sendChatFile,
    hangUp,
    notifySessionComplete,
    partnerCompletedSession,
  };
}
