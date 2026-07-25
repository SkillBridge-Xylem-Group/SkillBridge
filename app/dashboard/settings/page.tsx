import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import SettingsClient from "@/components/settings/SettingsClient";
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
  const { supabase, user } = await getRequestUser();
  if (!user) redirect("/login");

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

  const hasEmailPassword = user.identities?.some((identity) => identity.provider === "email") ?? false;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-1 flex-col pt-2">
      <SettingsClient
        email={user.email ?? ""}
        hasEmailPassword={hasEmailPassword}
        gender={asGender(row?.gender)}
        locationPreference={asLocation(row?.location_preference)}
        language={isAppLocale(row?.language) ? row.language : null}
      />
    </div>
  );
}
