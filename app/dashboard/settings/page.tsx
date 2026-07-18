import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsClient from "@/components/settings/SettingsClient";
import { deriveNameFromEmail } from "@/lib/deriveName";
import { isAppLocale } from "@/lib/i18n/locales";

export const metadata: Metadata = {
  title: "Settings | SkillBridge",
};

type Gender = "man" | "woman" | "non_binary" | "prefer_not_to_say";

function asGender(value: unknown): Gender | null {
  if (value === "man" || value === "woman" || value === "non_binary" || value === "prefer_not_to_say") {
    return value;
  }
  return null;
}

function asLocation(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let row: {
    fullname: string | null;
    experience_points: number | null;
    level: number | null;
    gender?: string | null;
    location_preference?: string | null;
    language?: string | null;
  } | null = null;

  const withSettings = await supabase
    .from("users")
    .select("fullname, experience_points, level, gender, location_preference, language")
    .eq("id", user.id)
    .maybeSingle();

  if (withSettings.error) {
    const fallback = await supabase
      .from("users")
      .select("fullname, experience_points, level")
      .eq("id", user.id)
      .maybeSingle();
    row = fallback.data;
  } else {
    row = withSettings.data;
  }

  const fullname =
    row?.fullname ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (user.email ? deriveNameFromEmail(user.email) : "there");

  const hasEmailPassword = user.identities?.some((identity) => identity.provider === "email") ?? false;

  return (
    <DashboardLayout
      userName={fullname}
      level={row?.level ?? 0}
      xp={row?.experience_points ?? 0}
      mainClassName="flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col px-4 pb-24 pt-5 sm:px-8 lg:px-10 lg:pb-10"
    >
      <SettingsClient
        email={user.email ?? ""}
        hasEmailPassword={hasEmailPassword}
        gender={asGender(row?.gender)}
        locationPreference={asLocation(row?.location_preference)}
        language={isAppLocale(row?.language) ? row.language : null}
      />
    </DashboardLayout>
  );
}
