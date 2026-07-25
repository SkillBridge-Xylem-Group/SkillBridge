import { detectFileType, isPlainTextBuffer, resolveOfficeMime, type DetectedFile } from "./magicBytes";

export type UploadValidationResult =
  | { ok: true; detected: DetectedFile; contentType: string }
  | { ok: false; error: string };

export function validateImageUpload(params: {
  buffer: Uint8Array;
  maxBytes: number;
  allowedMimes: Set<string>;
}): UploadValidationResult {
  const { buffer, maxBytes, allowedMimes } = params;

  if (buffer.length <= 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (buffer.length > maxBytes) {
    return { ok: false, error: "File is too large." };
  }

  const detected = detectFileType(buffer);
  if (!detected || !allowedMimes.has(detected.mime)) {
    return { ok: false, error: "Invalid or unsupported image file." };
  }

  return { ok: true, detected, contentType: detected.mime };
}

export function validateSessionChatUpload(params: {
  buffer: Uint8Array;
  maxBytes: number;
  declaredMime: string;
  allowedMimes: Set<string>;
}): UploadValidationResult {
  const { buffer, maxBytes, declaredMime, allowedMimes } = params;

  if (buffer.length <= 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (buffer.length > maxBytes) {
    return { ok: false, error: "File is too large." };
  }
  if (!allowedMimes.has(declaredMime)) {
    return { ok: false, error: "That file type is not allowed in session chat." };
  }

  const detected = detectFileType(buffer);
  if (!detected) {
    return { ok: false, error: "Unrecognized file type." };
  }

  let contentType = detected.mime;
  if (detected.mime === "application/zip") {
    const officeMime = resolveOfficeMime(detected, declaredMime);
    if (!officeMime) {
      return { ok: false, error: "Invalid Office document." };
    }
    contentType = officeMime;
  } else if (declaredMime === "text/plain") {
    if (!isPlainTextBuffer(buffer)) {
      return { ok: false, error: "Invalid text file." };
    }
    contentType = "text/plain";
  } else if (detected.mime !== declaredMime) {
    // Images / pdf / av / video must match declared MIME family.
    const declaredBase = declaredMime.split("/")[0];
    const detectedBase = detected.mime.split("/")[0];
    if (declaredBase !== detectedBase) {
      return { ok: false, error: "File content does not match its type." };
    }
    contentType = detected.mime;
  }

  if (!allowedMimes.has(contentType)) {
    return { ok: false, error: "That file type is not allowed in session chat." };
  }

  return { ok: true, detected, contentType };
}

export function safeUploadFileName(name: string, fallback: string): string {
  return name.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 120) || fallback;
}
