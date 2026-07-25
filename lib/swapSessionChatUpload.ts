export const MAX_SESSION_CHAT_FILE_BYTES = 20 * 1024 * 1024; // 20MB

/**
 * Upload a session-chat file via the server API (magic-byte validation).
 */
export async function uploadSessionChatFile(params: {
  requestId: string;
  userId: string;
  file: File;
}): Promise<
  | { ok: true; attachment: { name: string; mime: string; size: number; url: string } }
  | { ok: false; error: string }
> {
  const { requestId, file } = params;

  if (file.size <= 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (file.size > MAX_SESSION_CHAT_FILE_BYTES) {
    return { ok: false, error: "File is too large (max 20MB)." };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("requestId", requestId);

  const res = await fetch("/api/upload/session-chat", { method: "POST", body: formData });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, error: typeof body?.error === "string" ? body.error : "Upload failed." };
  }

  const attachment = body?.attachment;
  if (
    !attachment ||
    typeof attachment.url !== "string" ||
    typeof attachment.mime !== "string" ||
    typeof attachment.name !== "string" ||
    typeof attachment.size !== "number"
  ) {
    return { ok: false, error: "Upload succeeded but download link could not be created." };
  }

  return { ok: true, attachment };
}
