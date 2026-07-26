import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authResponseDelay } from "@/lib/auth/timing";
import { isAdminUser } from "@/lib/auth/isAdmin";
import { adminIpBlockedResponse, isAdminIpAllowedForRequest } from "@/lib/auth/adminAccess";

const mfaSchema = z.object({
  factorId: z.string().min(1),
  challengeId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/),
});

const GENERIC_ERROR = "Invalid verification code.";

export async function POST(request: Request) {
  if (!isAdminIpAllowedForRequest(request)) {
    await authResponseDelay();
    return NextResponse.json(adminIpBlockedResponse(), { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const parsed = mfaSchema.safeParse(body);
  if (!parsed.success) {
    await authResponseDelay();
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(supabase, user.id))) {
    await supabase.auth.signOut();
    await authResponseDelay();
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId: parsed.data.factorId,
    challengeId: parsed.data.challengeId,
    code: parsed.data.code,
  });

  if (error) {
    await authResponseDelay();
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  return NextResponse.json({ message: "Signed in" });
}
