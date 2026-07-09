"use client";

import { useState } from "react";
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
  const [bio, setBio] = useState(profile.bio);
  const [offered, setOffered] = useState<Skill[]>(initialOffered);
  const [wanted, setWanted] = useState<Skill[]>(initialWanted);

  const takenIds = new Set([...offered, ...wanted].map((s) => s.skill_id));

  return (
    <>
      <ProfileHeader
        fullname={profile.fullname}
        memberSince={memberSince}
        timezone={timezoneDisplay}
        bio={bio}
        onSaveBio={setBio}
      />

      <SkillsPanel
        icon={GraduationCap}
        iconBg="bg-brand-light"
        iconColor="text-brand"
        title="Skills I Offer"
        skills={offered}
        availableSkills={skillCatalog.filter((s) => !takenIds.has(s.skill_id))}
        onAdd={(skill) => setOffered((prev) => [...prev, skill])}
        onRemove={(skillId) => setOffered((prev) => prev.filter((s) => s.skill_id !== skillId))}
      />

      <SkillsPanel
        icon={Target}
        iconBg="bg-indigo-100"
        iconColor="text-indigo-600"
        title="Skills I Want to Learn"
        skills={wanted}
        availableSkills={skillCatalog.filter((s) => !takenIds.has(s.skill_id))}
        onAdd={(skill) => setWanted((prev) => [...prev, skill])}
        onRemove={(skillId) => setWanted((prev) => prev.filter((s) => s.skill_id !== skillId))}
      />
    </>
  );
}