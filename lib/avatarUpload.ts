export const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Upload a profile photo via the server API (magic-byte validation).
 */
export async function uploadAvatar(params: {
  userId: string;
  file: File;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  void params.userId;

  if (params.file.size <= 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (params.file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: "Image is too large (max 5MB)." };
  }

  const formData = new FormData();
  formData.append("file", params.file);

  const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, error: typeof body?.error === "string" ? body.error : "Upload failed." };
  }
  if (typeof body?.url !== "string") {
    return { ok: false, error: "Upload succeeded but public URL could not be created." };
  }

  return { ok: true, url: body.url };
}
