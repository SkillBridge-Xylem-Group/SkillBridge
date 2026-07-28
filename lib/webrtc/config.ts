/** WebRTC capture + encoding defaults for 1:1 skill swap sessions. */

export const VIDEO_CAPTURE: MediaTrackConstraints = {
  facingMode: "user",
  width: { ideal: 1280, max: 1280 },
  height: { ideal: 720, max: 720 },
  frameRate: { ideal: 24, max: 30 },
  aspectRatio: { ideal: 16 / 9 },
};

export const AUDIO_CAPTURE: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

/** Target outbound video bitrate (2 Mbps suits 720p24 well on typical home networks). */
const VIDEO_MAX_BITRATE = 2_000_000;
const VIDEO_MAX_FRAMERATE = 24;

export function buildIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL?.trim();
  if (turnUrl) {
    servers.push({
      urls: turnUrl,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME?.trim() || undefined,
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL?.trim() || undefined,
    });
  }

  return servers;
}

export function tagVideoTrackForDetail(track: MediaStreamTrack) {
  if (track.kind !== "video") return;
  try {
    track.contentHint = "detail";
  } catch {
    // Unsupported in some browsers.
  }
}

export function preferHardwareFriendlyCodecs(transceiver: RTCRtpTransceiver) {
  if (typeof RTCRtpReceiver === "undefined" || !RTCRtpReceiver.getCapabilities) return;
  const caps = RTCRtpReceiver.getCapabilities("video");
  if (!caps?.codecs.length) return;

  const order = ["video/H264", "video/VP8", "video/VP9"];
  const sorted = [...caps.codecs].sort((a, b) => {
    const ai = order.indexOf(a.mimeType);
    const bi = order.indexOf(b.mimeType);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  try {
    transceiver.setCodecPreferences(sorted);
  } catch {
    // setCodecPreferences can fail before negotiation in some browsers.
  }
}

/** Raise encoder bitrate cap and prefer smooth playback over sharpness when congested. */
export async function tuneVideoSender(sender: RTCRtpSender | null) {
  if (!sender) return;
  try {
    const params = sender.getParameters();
    const encodings = params.encodings?.length ? [...params.encodings] : [{}];
    encodings[0] = {
      ...encodings[0],
      maxBitrate: VIDEO_MAX_BITRATE,
      maxFramerate: VIDEO_MAX_FRAMERATE,
    };
    params.encodings = encodings;
    params.degradationPreference = "balanced";
    await sender.setParameters(params);
  } catch (err) {
    console.warn("[swap-webrtc] tuneVideoSender failed:", err);
  }
}
