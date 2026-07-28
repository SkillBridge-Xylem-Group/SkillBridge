"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadSessionChatFile } from "@/lib/swapSessionChatUpload";
import {
  AUDIO_CAPTURE,
  buildIceServers,
  tagVideoTrackForDetail,
  tuneVideoSender,
  VIDEO_CAPTURE,
} from "@/lib/webrtc/config";

type SignalPayload =
  | { type: "offer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; from: string; candidate: RTCIceCandidateInit }
  | { type: "hangup"; from: string }
  | { type: "session-complete"; from: string };

type MediaStatePayload = {
  from: string;
  camera: boolean;
  mic: boolean;
};

export type ChatAttachment = {
  name: string;
  mime: string;
  size: number;
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

type Options = {
  requestId: string;
  userId: string;
  userName: string;
};

function mediaErrorMessage(err: unknown): string {
  if (!window.isSecureContext) {
    return "Camera and microphone need a secure page (https or localhost).";
  }
  const name = err && typeof err === "object" && "name" in err ? String((err as { name: string }).name) : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Permission denied. Allow camera and microphone, then click Enable devices.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera or microphone was found on this device.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "Camera or microphone is in use by another app.";
  }
  return "Could not access camera or microphone.";
}

async function acquireMedia(): Promise<{ stream: MediaStream; warning: string | null }> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("MediaDevices API unavailable");
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: AUDIO_CAPTURE,
      video: VIDEO_CAPTURE,
    });
    stream.getVideoTracks().forEach(tagVideoTrackForDetail);
    return { stream, warning: null };
  } catch {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_CAPTURE, video: false });
    return {
      stream,
      warning: "Camera unavailable — microphone is on. You can still chat in text.",
    };
  }
}

function liveVideoTrack(stream: MediaStream | null): MediaStreamTrack | null {
  return stream?.getVideoTracks().find((t) => t.readyState !== "ended") ?? null;
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
  const [partnerCameraOn, setPartnerCameraOn] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [partnerCompletedSession, setPartnerCompletedSession] = useState(false);
  const [remoteHasVideo, setRemoteHasVideo] = useState(false);
  const [remoteCameraEnabled, setRemoteCameraEnabled] = useState(false);

  const localVideoEl = useRef<HTMLVideoElement | null>(null);
  const remoteVideoEl = useRef<HTMLVideoElement | null>(null);
  const remoteAudioEl = useRef<HTMLAudioElement | null>(null);
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
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const renegotiateRef = useRef<(() => Promise<void>) | null>(null);
  const broadcastMediaStateRef = useRef<((camera: boolean, mic: boolean) => void) | null>(null);

  const attachRemotePlayback = useCallback((stream: MediaStream) => {
    remoteStreamRef.current = stream;
    if (remoteVideoEl.current) {
      remoteVideoEl.current.srcObject = stream;
      void remoteVideoEl.current.play().catch(() => undefined);
    }
    if (remoteAudioEl.current) {
      remoteAudioEl.current.srcObject = stream;
      void remoteAudioEl.current.play().catch(() => undefined);
    }
  }, []);

  const syncRemoteTrackFlags = useCallback((stream: MediaStream | null) => {
    const video = liveVideoTrack(stream);
    setRemoteHasVideo(Boolean(video));
    setRemoteCameraEnabled(Boolean(video && video.readyState === "live" && video.enabled && !video.muted));
  }, []);

  const watchRemoteVideoTrack = useCallback(
    (track: MediaStreamTrack) => {
      if (track.kind !== "video") return;
      const sync = () => syncRemoteTrackFlags(remoteStreamRef.current);
      track.onmute = sync;
      track.onunmute = () => {
        sync();
        void remoteVideoEl.current?.play().catch(() => undefined);
      };
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

  const bindRemoteVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      remoteVideoEl.current = el;
      if (el && remoteStreamRef.current) {
        el.srcObject = remoteStreamRef.current;
        el.muted = true;
        void el.play().catch(() => undefined);
      }
    },
    []
  );

  const bindRemoteAudio = useCallback((el: HTMLAudioElement | null) => {
    remoteAudioEl.current = el;
    if (el && remoteStreamRef.current) {
      el.srcObject = remoteStreamRef.current;
      void el.play().catch(() => undefined);
    }
  }, []);

  const syncLocalPreview = useCallback(() => {
    const el = localVideoEl.current;
    const stream = localStreamRef.current;
    if (!el || !stream) return;
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

  const syncSenders = useCallback((stream: MediaStream) => {
    const pc = pcRef.current;
    if (!pc) return false;

    let changed = false;
    for (const track of stream.getTracks()) {
      const sender = pc.getSenders().find((s) => s.track?.kind === track.kind);
      if (!sender) {
        pc.addTrack(track, stream);
        changed = true;
      } else if (sender.track?.id !== track.id) {
        void sender.replaceTrack(track);
        changed = true;
      }
      if (track.kind === "video") void tuneVideoSender(sender ?? pc.getSenders().find((s) => s.track?.kind === "video") ?? null);
    }
    return changed;
  }, []);

  const applyLocalStream = useCallback(
    (stream: MediaStream, warning: string | null) => {
      const prev = localStreamRef.current;
      if (prev && prev !== stream) prev.getTracks().forEach((t) => t.stop());

      localStreamRef.current = stream;
      stream.getVideoTracks().forEach(tagVideoTrackForDetail);
      syncLocalPreview();
      syncTrackFlags(stream);
      setMediaError(null);
      setMediaWarning(warning);

      const audio = stream.getAudioTracks()[0];
      const video = stream.getVideoTracks()[0];
      broadcastMediaStateRef.current?.(Boolean(video?.enabled), Boolean(audio?.enabled));

      const changed = syncSenders(stream);
      if (changed && pcRef.current?.remoteDescription && partnerIdRef.current) {
        void renegotiateRef.current?.();
      }
    },
    [syncLocalPreview, syncSenders, syncTrackFlags]
  );

  const enableDevices = useCallback(async () => {
    setMediaBusy(true);
    try {
      const { stream, warning } = await acquireMedia();
      applyLocalStream(stream, warning);
    } catch (err) {
      console.error("[swap-webrtc] enableDevices failed:", err);
      setMediaError(mediaErrorMessage(err));
      syncTrackFlags(localStreamRef.current);
    } finally {
      setMediaBusy(false);
    }
  }, [applyLocalStream, syncTrackFlags]);

  useEffect(() => {
    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    endedRef.current = false;
    offerStartedRef.current = false;

    async function sendSignal(payload: SignalPayload) {
      await channelRef.current?.send({ type: "broadcast", event: "signal", payload });
    }

    function broadcastMediaState(camera: boolean, mic: boolean) {
      void channelRef.current?.send({
        type: "broadcast",
        event: "media-state",
        payload: { from: userId, camera, mic } satisfies MediaStatePayload,
      });
    }
    broadcastMediaStateRef.current = broadcastMediaState;

    function resetPeer() {
      pcRef.current?.close();
      pcRef.current = null;
      offerStartedRef.current = false;
      pendingIceRef.current = [];
      remoteStreamRef.current = null;
      if (remoteVideoEl.current) remoteVideoEl.current.srcObject = null;
      if (remoteAudioEl.current) remoteAudioEl.current.srcObject = null;
      syncRemoteTrackFlags(null);
    }

    async function flushPendingIce(pc: RTCPeerConnection) {
      if (!pc.remoteDescription) return;
      const pending = pendingIceRef.current;
      pendingIceRef.current = [];
      for (const candidate of pending) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          console.warn("[swap-webrtc] queued ice failed:", err);
        }
      }
    }

    async function renegotiate() {
      if (endedRef.current || makingOfferRef.current) return;
      const pc = pcRef.current;
      if (!pc || !partnerIdRef.current || !pc.remoteDescription || pc.signalingState !== "stable") return;

      try {
        makingOfferRef.current = true;
        setConnectionState("connecting-peer");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (pc.localDescription) {
          await sendSignal({ type: "offer", from: userId, sdp: pc.localDescription });
        }
      } catch (err) {
        console.error("[swap-webrtc] renegotiate failed:", err);
      } finally {
        makingOfferRef.current = false;
      }
    }
    renegotiateRef.current = renegotiate;

    function ensurePeerConnection() {
      if (pcRef.current) return pcRef.current;

      const pc = new RTCPeerConnection({
        iceServers: buildIceServers(),
        bundlePolicy: "max-bundle",
      });
      pcRef.current = pc;

      const remote = new MediaStream();
      attachRemotePlayback(remote);

      pc.ontrack = (event) => {
        const tracks = event.streams[0]?.getTracks() ?? [event.track];
        for (const track of tracks) {
          if (!remote.getTracks().some((t) => t.id === track.id)) remote.addTrack(track);
          if (track.kind === "video") watchRemoteVideoTrack(track);
        }
        attachRemotePlayback(remote);
        syncRemoteTrackFlags(remote);
        setConnectionState("connected");
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        void sendSignal({ type: "ice", from: userId, candidate: event.candidate.toJSON() });
      };

      pc.onconnectionstatechange = () => {
        if (endedRef.current) return;
        const state = pc.connectionState;
        if (state === "connected") {
          setConnectionState("connected");
          const videoSender = pc.getSenders().find((s) => s.track?.kind === "video") ?? null;
          void tuneVideoSender(videoSender);
        } else if (state === "failed") {
          setConnectionState("failed");
        } else if (state === "disconnected") {
          setConnectionState("waiting");
        }
      };

      const local = localStreamRef.current;
      if (local) syncSenders(local);

      return pc;
    }

    async function makeOffer() {
      if (offerStartedRef.current || endedRef.current || makingOfferRef.current) return;
      offerStartedRef.current = true;
      makingOfferRef.current = true;
      const pc = ensurePeerConnection();
      try {
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
          await flushPendingIce(pc);
          if (pc.localDescription) {
            await sendSignal({ type: "answer", from: userId, sdp: pc.localDescription });
          }
          offerStartedRef.current = true;
        } else if (payload.type === "answer") {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(payload.sdp);
            await flushPendingIce(pc);
          }
        } else if (payload.type === "ice") {
          if (!pc.remoteDescription) {
            pendingIceRef.current.push(payload.candidate);
            return;
          }
          try {
            await pc.addIceCandidate(payload.candidate);
          } catch (err) {
            if (!ignoreOfferRef.current) throw err;
          }
        }
      } catch (err) {
        console.error("[swap-webrtc] signal failed:", err);
        setConnectionState("failed");
      }
    }

    async function start() {
      setConnectionState("connecting");

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
        }
      }

      if (cancelled) return;

      const channelRes = await fetch(`/api/swap-session/${requestId}/channel`, { method: "POST" });
      if (!channelRes.ok) {
        if (!cancelled) {
          setConnectionState("failed");
          setMediaError("Could not join session. Refresh and try again.");
        }
        return;
      }

      const { channel: channelTopic } = (await channelRes.json()) as { channel?: string };
      if (!channelTopic) {
        if (!cancelled) {
          setConnectionState("failed");
          setMediaError("Could not join session. Refresh and try again.");
        }
        return;
      }

      const supabase = createSupabaseBrowserClient();
      channel = supabase.channel(channelTopic, {
        config: { broadcast: { self: false }, presence: { key: userId } },
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

      channel.on("broadcast", { event: "media-state" }, ({ payload }) => {
        const state = payload as MediaStatePayload;
        if (!state?.from || state.from === userId) return;
        setPartnerCameraOn(state.camera);
      });

      channel.on("presence", { event: "sync" }, () => {
        if (endedRef.current) return;
        const peers = Object.keys(channel?.presenceState() ?? {}).filter((id) => id !== userId);
        setPartnerPresent(peers.length > 0);

        if (peers.length === 0) {
          partnerIdRef.current = null;
          resetPeer();
          setConnectionState("waiting");
          return;
        }

        const partnerId = peers[0];
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
        setMediaError((prev) => prev ?? "Could not join session room.");
        setConnectionState("failed");
        return;
      }

      await channel.track({ userId, joinedAt: Date.now() });
      const local = localStreamRef.current;
      broadcastMediaState(
        Boolean(local?.getVideoTracks()[0]?.enabled),
        Boolean(local?.getAudioTracks()[0]?.enabled)
      );
      setConnectionState("waiting");
    }

    void start();

    return () => {
      cancelled = true;
      endedRef.current = true;
      broadcastMediaStateRef.current = null;
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
      if (channel) void createSupabaseBrowserClient().removeChannel(channel);
      pendingIceRef.current = [];
      channelRef.current = null;
      renegotiateRef.current = null;
    };
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
    const camOn = Boolean(localStreamRef.current?.getVideoTracks()[0]?.enabled);
    broadcastMediaStateRef.current?.(camOn, track.enabled);
  }, [enableDevices]);

  const toggleCamera = useCallback(async () => {
    const stream = localStreamRef.current;
    const track = stream?.getVideoTracks().find((t) => t.readyState === "live");

    if (track) {
      track.enabled = !track.enabled;
      setCameraEnabled(track.enabled);
      syncLocalPreview();
      const micOn = Boolean(localStreamRef.current?.getAudioTracks()[0]?.enabled);
      broadcastMediaStateRef.current?.(track.enabled, micOn);
      return;
    }

    setMediaBusy(true);
    try {
      const videoOnly = await navigator.mediaDevices.getUserMedia({ video: VIDEO_CAPTURE, audio: false });
      const videoTrack = videoOnly.getVideoTracks()[0];
      if (!videoTrack) throw new Error("No video track");
      tagVideoTrackForDetail(videoTrack);

      if (stream) {
        stream.getVideoTracks().forEach((t) => {
          stream.removeTrack(t);
          t.stop();
        });
        stream.addTrack(videoTrack);
        applyLocalStream(stream, null);
      } else {
        applyLocalStream(videoOnly, null);
      }
    } catch (err) {
      console.error("[swap-webrtc] camera failed:", err);
      setMediaError(mediaErrorMessage(err));
    } finally {
      setMediaBusy(false);
    }
  }, [applyLocalStream, syncLocalPreview]);

  const publishChat = useCallback(async (msg: ChatMessage) => {
    if (!channelRef.current) return false;
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    await channelRef.current.send({ type: "broadcast", event: "chat", payload: msg });
    return true;
  }, []);

  const sendChat = useCallback(
    async (text: string, attachment?: ChatAttachment) => {
      const trimmed = text.trim();
      if ((!trimmed && !attachment) || !channelRef.current) return false;
      return publishChat({
        id: `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        from: userId,
        fromName: userName,
        text: trimmed.slice(0, 2000),
        at: Date.now(),
        attachment,
      });
    },
    [publishChat, userId, userName]
  );

  const sendChatFile = useCallback(
    async (file: File, caption = "") => {
      if (!channelRef.current) return { ok: false as const, error: "Chat is not connected." };
      const uploaded = await uploadSessionChatFile({ requestId, userId, file });
      if (!uploaded.ok) return uploaded;
      const ok = await sendChat(caption, uploaded.attachment);
      return ok ? { ok: true as const } : { ok: false as const, error: "Could not send file." };
    },
    [requestId, sendChat, userId]
  );

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
    if (remoteAudioEl.current) remoteAudioEl.current.srcObject = null;
    setMediaReady(false);
    setHasMic(false);
    setHasCamera(false);
    setMicEnabled(false);
    setCameraEnabled(false);
  }, [userId]);

  return {
    bindLocalVideo,
    bindRemoteVideo,
    bindRemoteAudio,
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
    partnerCameraOn,
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
