import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateOrCreateUser } from "@/lib/profile/upsertUser";
import { COUNTRY_OPTIONS } from "@/lib/settingsOptions";
import { LOCALE_OPTIONS } from "@/lib/i18n/locales";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/auth/rate-limit";

export const GENDER_VALUES = ["man", "woman", "non_binary", "prefer_not_to_say"] as const;

const countryCodes = COUNTRY_OPTIONS.map((c) => c.code) as [string, ...string[]];
const localeCodes = LOCALE_OPTIONS.map((l) => l.code) as [string, ...string[]];

const locationSchema = z.union([
  z.literal("approximate"),
  z.literal("none"),
  z.enum(countryCodes),
]);

const settingsSchema = z
  .object({
    gender: z.enum(GENDER_VALUES).optional(),
    location_preference: locationSchema.optional(),
    language: z.enum(localeCodes).optional(),
  })
  .refine(
    (data) =>
      data.gender !== undefined ||
      data.location_preference !== undefined ||
      data.language !== undefined,
    { message: "Nothing to update" }
  );

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const ipLimit = checkRateLimit("settings:update:ip", ip, MAX_PER_IP, WINDOW_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: rateLimitHeaders(ipLimit.retryAfterMs) }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error } = await updateOrCreateUser(supabase, user, {
    ...(parsed.data.gender !== undefined ? { gender: parsed.data.gender } : {}),
    ...(parsed.data.location_preference !== undefined
      ? { location_preference: parsed.data.location_preference }
      : {}),
    ...(parsed.data.language !== undefined ? { language: parsed.data.language } : {}),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Settings saved",
    gender: parsed.data.gender,
    location_preference: parsed.data.location_preference,
    language: parsed.data.language,
  });
}
