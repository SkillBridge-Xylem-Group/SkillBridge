import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GraduationCap, Target } from "lucide-react";
import { getRequestUser } from "@/lib/dashboardShell";
import PublicProfileHeader from "@/components/profile/PublicProfileHeader";
import SkillChipList from "@/components/profile/SkillChipList";
import LevelCard from "@/components/profile/LevelCard";
import TrustScoreCard from "@/components/profile/TrustScoreCard";
import ReviewsCard from "@/components/profile/ReviewsCard";
import { getUserSkills } from "@/lib/skillCatalog";
import { getUserReviews } from "@/lib/reviews";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isAppLocale, DEFAULT_LOCALE, dateLocaleTag } from "@/lib/i18n/locales";
import { normalizeAvatarUrl } from "@/lib/avatar";

export const metadata: Metadata = {
  title: "Member Profile | SkillBridge",
};

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, user: viewer } = await getRequestUser();
  if (!viewer) redirect("/login");

  const { data: viewerRow } = await supabase
    .from("users")
    .select("fullname, slug, language")
    .eq("id", viewer.id)
    .maybeSingle();

  if (viewerRow?.slug === slug) {
    redirect("/dashboard/profile");
  }

  const locale = isAppLocale(viewerRow?.language) ? viewerRow!.language! : DEFAULT_LOCALE;
  const dictionary = getDictionary(locale);
  const p = dictionary.profile;

  const { data: profileRow } = await supabase
    .from("users")
    .select("id, fullname, bio, avatar_url, slug, timezone, experience_points, level, trust_score, created_at, public_uid")
    .eq("slug", slug)
    .maybeSingle();

  if (!profileRow) {
    return (
      <div className="nb-card mt-2 p-10 text-center">
        <h1 className="text-xl font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>{p.memberNotFound}</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--sb-muted)" }}>{p.profileNotFoundHint}</p>
      </div>
    );
  }

  const memberSince = new Date(profileRow.created_at ?? Date.now()).toLocaleDateString(
    dateLocaleTag(locale),
    { month: "long", year: "numeric" }
  );
  const timezone = profileRow.timezone ?? "UTC";
  const timezoneDisplay =
    new Intl.DateTimeFormat(dateLocaleTag(locale), {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value ?? timezone;

  const [offered, wanted, { reviews, trustScore, reviewCount }] = await Promise.all([
    getUserSkills(supabase, "user_skill_offered", profileRow.id),
    getUserSkills(supabase, "user_skill_wanted", profileRow.id),
    getUserReviews(supabase, profileRow.id),
  ]);

  return (
    <div className="grid grid-cols-1 gap-6 pt-2 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <PublicProfileHeader
          fullname={profileRow.fullname}
          username={profileRow.slug}
          avatarUrl={normalizeAvatarUrl(profileRow.avatar_url)}
          publicUid={profileRow.public_uid ?? null}
          memberSince={memberSince}
          memberSinceLabel={p.memberSince}
          timezone={timezoneDisplay}
          bio={profileRow.bio}
          noBioText={p.noBioYet}
          profileId={profileRow.id}
        />

        <SkillChipList
          icon={GraduationCap}
          iconColor="var(--sb-teal-dark)"
          title={p.skillsOffered}
          noneAddedText={p.noneAdded}
          skills={offered}
        />

        <SkillChipList
          icon={Target}
          iconColor="var(--sb-emerald-dark)"
          title={p.skillsWanted}
          noneAddedText={p.noneAdded}
          skills={wanted}
        />

        <ReviewsCard reviews={reviews} />
      </div>

      <div className="space-y-6">
        <LevelCard level={profileRow.level ?? 0} experiencePoints={profileRow.experience_points ?? 0} />
        <TrustScoreCard trustScore={trustScore} reviewCount={reviewCount} />
      </div>
    </div>
  );
}
