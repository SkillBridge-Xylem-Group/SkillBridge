export type DetectedFile = {
  mime: string;
  ext: string;
};

function matchesAt(buffer: Uint8Array, offset: number, bytes: number[]): boolean {
  if (buffer.length < offset + bytes.length) return false;
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

function readAscii(buffer: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...buffer.slice(start, start + length));
}

/** Detect file type from the first bytes — ignores client-declared MIME. */
export function detectFileType(buffer: Uint8Array): DetectedFile | null {
  if (buffer.length < 4) return null;

  if (matchesAt(buffer, 0, [0xff, 0xd8, 0xff])) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (matchesAt(buffer, 0, [0x89, 0x50, 0x4e, 0x47])) {
    return { mime: "image/png", ext: "png" };
  }
  if (matchesAt(buffer, 0, [0x47, 0x49, 0x46, 0x38])) {
    return { mime: "image/gif", ext: "gif" };
  }
  if (
    buffer.length >= 12 &&
    matchesAt(buffer, 0, [0x52, 0x49, 0x46, 0x46]) &&
    readAscii(buffer, 8, 4) === "WEBP"
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  if (matchesAt(buffer, 0, [0x25, 0x50, 0x44, 0x46])) {
    return { mime: "application/pdf", ext: "pdf" };
  }
  if (matchesAt(buffer, 0, [0x49, 0x44, 0x33]) || matchesAt(buffer, 0, [0xff, 0xfb])) {
    return { mime: "audio/mpeg", ext: "mp3" };
  }
  if (matchesAt(buffer, 0, [0x52, 0x49, 0x46, 0x46]) && buffer.length >= 12 && readAscii(buffer, 8, 4) === "WAVE") {
    return { mime: "audio/wav", ext: "wav" };
  }
  if (buffer.length >= 12 && readAscii(buffer, 4, 4) === "ftyp") {
    const brand = readAscii(buffer, 8, 4);
    if (brand.startsWith("mp4") || brand.startsWith("isom") || brand.startsWith("avc1")) {
      return { mime: "video/mp4", ext: "mp4" };
    }
    if (brand.startsWith("web")) {
      return { mime: "video/webm", ext: "webm" };
    }
  }
  if (matchesAt(buffer, 0, [0x1a, 0x45, 0xdf, 0xa3])) {
    return { mime: "video/webm", ext: "webm" };
  }
  if (matchesAt(buffer, 0, [0x50, 0x4b, 0x03, 0x04])) {
    return { mime: "application/zip", ext: "zip" };
  }

  const sample = buffer.slice(0, Math.min(buffer.length, 512));
  const hasNull = sample.some((byte) => byte === 0);
  if (!hasNull) {
    return { mime: "text/plain", ext: "txt" };
  }

  return null;
}

const OFFICE_ZIP_MIMES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

/** Map a zip-based Office file to its declared MIME when magic bytes only say "zip". */
export function resolveOfficeMime(detected: DetectedFile, declaredMime: string): string | null {
  if (detected.mime !== "application/zip") return detected.mime;
  if (!OFFICE_ZIP_MIMES.has(declaredMime)) return null;
  return declaredMime;
}

export function isPlainTextBuffer(buffer: Uint8Array): boolean {
  const sample = buffer.slice(0, Math.min(buffer.length, 512));
  return !sample.some((byte) => byte === 0);
}
