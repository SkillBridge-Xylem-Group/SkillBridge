"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Target } from "lucide-react";
import type { Profile, Skill } from "@/lib/types/profile";
import ProfileHeader from "./ProfileHeader";
import SkillsPanel from "./SkillsPanel";

type ProfileClientProps = {
  profile: Profile;
  memberSince: string;
  timezoneDisplay: string;
  initialOffered: Skill[];
  initialWanted: Skill[];
  skillCatalog: Skill[];
};

export default function ProfileClient({
  profile,
  memberSince,
  timezoneDisplay,
  initialOffered,
  initialWanted,
  skillCatalog,
}: ProfileClientProps) {
  const router = useRouter();
  const [fullname, setFullname] = useState(profile.fullname);
  const [bio, setBio] = useState(profile.bio);
  const [offered, setOffered] = useState<Skill[]>(initialOffered);
  const [wanted, setWanted] = useState<Skill[]>(initialWanted);
  const [profileError, setProfileError] = useState("");

  const takenIds = new Set([...offered, ...wanted].map((s) => s.skill_id));

  async function handleSaveProfile(nextName: string, nextBio: string) {
    setProfileError("");
    const previousName = fullname;
    const previousBio = bio;
    setFullname(nextName);
    setBio(nextBio);

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nextName, bio: nextBio }),
    });

    if (!res.ok) {
      setFullname(previousName);
      setBio(previousBio);
      const data = await res.json().catch(() => null);
      setProfileError(data?.error ?? "Failed to save profile. Please try again.");
      return;
    }

    // Refresh so the topbar/sidebar (rendered server-side from the same
    // profiles row) pick up the new name too.
    router.refresh();
  }

  async function persistSkills(nextOffered: Skill[], nextWanted: Skill[]) {
    const res = await fetch("/api/profile/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offered: nextOffered.map((s) => s.skill_name),
        wanted: nextWanted.map((s) => s.skill_name),
      }),
    });
    return res.ok;
  }

  async function handleAddOffered(skill: Skill) {
    const previous = offered;
    const next = [...offered, skill];
    setOffered(next);
    if (!(await persistSkills(next, wanted))) setOffered(previous);
  }

  async function handleRemoveOffered(skillId: number) {
    const previous = offered;
    const next = offered.filter((s) => s.skill_id !== skillId);
    setOffered(next);
    if (!(await persistSkills(next, wanted))) setOffered(previous);
  }

  async function handleAddWanted(skill: Skill) {
    const previous = wanted;
    const next = [...wanted, skill];
    setWanted(next);
    if (!(await persistSkills(offered, next))) setWanted(previous);
  }

  async function handleRemoveWanted(skillId: number) {
    const previous = wanted;
    const next = wanted.filter((s) => s.skill_id !== skillId);
    setWanted(next);
    if (!(await persistSkills(offered, next))) setWanted(previous);
  }

  return (
    <>
      <ProfileHeader
        fullname={fullname}
        memberSince={memberSince}
        timezone={timezoneDisplay}
        bio={bio}
        onSaveProfile={handleSaveProfile}
        profileError={profileError}
      />

      <SkillsPanel
        icon={GraduationCap}
        iconBg="bg-brand-light"
        iconColor="text-brand"
        title="Skills I Offer"
        skills={offered}
        availableSkills={skillCatalog.filter((s) => !takenIds.has(s.skill_id))}
        onAdd={handleAddOffered}
        onRemove={handleRemoveOffered}
      />

      <SkillsPanel
        icon={Target}
        iconBg="bg-indigo-100"
        iconColor="text-indigo-600"
        title="Skills I Want to Learn"
        skills={wanted}
        availableSkills={skillCatalog.filter((s) => !takenIds.has(s.skill_id))}
        onAdd={handleAddWanted}
        onRemove={handleRemoveWanted}
      />
    </>
  );
}