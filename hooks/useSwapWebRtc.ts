"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SignalPayload =
  | { type: "offer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; from: string; candidate: RTCIceCandidateInit }
  | { type: "hangup"; from: string };

export type ConnectionState = "connecting" | "waiting" | "connecting-peer" | "connected" | "failed" | "ended";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

type Options = {
  requestId: string;
  userId: string;
};

export function useSwapWebRtc({ requestId, userId }: Options) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [partnerPresent, setPartnerPresent] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const isPoliteRef = useRef(false);
  const offerStartedRef = useRef(false);
  const endedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    endedRef.current = false;
    offerStartedRef.current = false;

    function attachLocal(stream: MediaStream) {
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    }

    function attachRemote(stream: MediaStream) {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
    }

    async function sendSignal(payload: SignalPayload) {
      const ch = channelRef.current;
      if (!ch) return;
      await ch.send({ type: "broadcast", event: "signal", payload });
    }

    function resetPeer() {
      pcRef.current?.close();
      pcRef.current = null;
      offerStartedRef.current = false;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
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
      attachRemote(remote);

      pc.ontrack = (event) => {
        const inbound = event.streams[0];
        if (inbound) {
          for (const track of inbound.getTracks()) {
            if (!remote.getTracks().some((t) => t.id === track.id)) {
              remote.addTrack(track);
            }
          }
        } else {
          remote.addTrack(event.track);
        }
        attachRemote(remote);
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
      setMediaError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: "user" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        attachLocal(stream);
      } catch (err) {
        console.error("[swap-webrtc] getUserMedia failed:", err);
        setMediaError(
          "Could not access camera or microphone. Check browser permissions and try again."
        );
        setConnectionState("failed");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      channel = supabase.channel(`swap-session:${requestId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: userId },
        },
      });
      channelRef.current = channel;

      channel.on("broadcast", { event: "signal" }, ({ payload }) => {
        void handleSignal(payload as SignalPayload);
      });

      channel.on("presence", { event: "sync" }, () => {
        if (endedRef.current) return;
        const state = channel?.presenceState() ?? {};
        const peers = Object.keys(state);
        const others = peers.filter((id) => id !== userId);
        setPartnerPresent(others.length > 0);

        if (others.length === 0) {
          resetPeer();
          setConnectionState("waiting");
          return;
        }

        const partnerId = others[0];
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
        setMediaError("Could not join the session room. Check your connection and try again.");
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
      if (channel) {
        const supabase = createSupabaseBrowserClient();
        void supabase.removeChannel(channel);
      }
      channelRef.current = null;
    };
  }, [requestId, userId]);

  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicEnabled(track.enabled);
  }, []);

  const toggleCamera = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCameraEnabled(track.enabled);
  }, []);

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
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, [userId]);

  return {
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
  };
}
