"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Target } from "lucide-react";
import type { Profile, Skill } from "@/lib/types/profile";
import ProfileHeader from "./ProfileHeader";
import SkillsPanel from "./SkillsPanel";
import { useLocale } from "@/components/i18n/LocaleProvider";

type ProfileClientProps = {
  profile: Profile;
  timezoneDisplay: string;
  initialOffered: Skill[];
  initialWanted: Skill[];
  skillCatalog: Skill[];
};

export default function ProfileClient({
  profile,
  timezoneDisplay,
  initialOffered,
  initialWanted,
  skillCatalog,
}: ProfileClientProps) {
  const router = useRouter();
  const { dictionary } = useLocale();
  const [fullname, setFullname] = useState(profile.fullname);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [offered, setOffered] = useState<Skill[]>(initialOffered);
  const [wanted, setWanted] = useState<Skill[]>(initialWanted);
  const [profileError, setProfileError] = useState("");

  const takenIds = new Set([...offered, ...wanted].map((s) => s.skill_id));

  function usernameErrorMessage(code: string | undefined) {
    switch (code) {
      case "TOO_SHORT":
        return dictionary.profile.usernameTooShort;
      case "TOO_LONG":
        return dictionary.profile.usernameTooLong;
      case "MUST_START_WITH_LETTER":
        return dictionary.profile.usernameMustStartWithLetter;
      case "INVALID_CHARS":
        return dictionary.profile.usernameInvalidChars;
      case "RESERVED":
        return dictionary.profile.usernameReserved;
      case "TAKEN":
        return dictionary.profile.usernameTaken;
      default:
        return dictionary.profile.saveProfileFailed;
    }
  }

  async function handleSaveProfile(nextName: string, nextBio: string, nextUsername: string) {
    setProfileError("");
    const previousName = fullname;
    const previousBio = bio;
    const previousUsername = username;

    if (nextUsername !== username) {
      const usernameRes = await fetch("/api/profile/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: nextUsername }),
      });
      if (!usernameRes.ok) {
        const data = await usernameRes.json().catch(() => null);
        setProfileError(usernameErrorMessage(data?.error));
        return false;
      }
      setUsername(nextUsername);
    }

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
      setUsername(previousUsername);
      const data = await res.json().catch(() => null);
      setProfileError(data?.error ?? dictionary.profile.saveProfileFailed);
      return false;
    }

    router.refresh();
    return true;
  }

  async function handleAvatarChange(nextUrl: string) {
    setProfileError("");
    const previous = avatarUrl;
    setAvatarUrl(nextUrl);

    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: nextUrl }),
    });

    if (!res.ok) {
      setAvatarUrl(previous);
      const data = await res.json().catch(() => null);
      setProfileError(data?.error ?? dictionary.profile.savePhotoFailed);
      return;
    }

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
        userId={profile.user_id}
        publicUid={profile.public_uid}
        fullname={fullname}
        username={username}
        createdAt={profile.created_at}
        timezone={timezoneDisplay}
        bio={bio}
        avatarUrl={avatarUrl}
        onSaveProfile={handleSaveProfile}
        onAvatarChange={handleAvatarChange}
        profileError={profileError}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SkillsPanel
          icon={GraduationCap}
          iconColor="var(--sb-teal-dark)"
          title={dictionary.profile.skillsTeach}
          skills={offered}
          availableSkills={skillCatalog.filter((s) => !takenIds.has(s.skill_id))}
          onAdd={handleAddOffered}
          onRemove={handleRemoveOffered}
        />

        <SkillsPanel
          icon={Target}
          iconColor="var(--sb-emerald-dark)"
          title={dictionary.profile.skillsLearn}
          skills={wanted}
          availableSkills={skillCatalog.filter((s) => !takenIds.has(s.skill_id))}
          onAdd={handleAddWanted}
          onRemove={handleRemoveWanted}
        />
      </div>
    </>
  );
}