import { handleForumImageUpload } from "@/lib/uploads/serverUpload";

export async function POST(req: Request) {
  return handleForumImageUpload(req);
}
