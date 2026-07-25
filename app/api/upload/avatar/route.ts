import { handleAvatarUpload } from "@/lib/uploads/serverUpload";

export async function POST(req: Request) {
  return handleAvatarUpload(req);
}
