"use client";

import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import ProfileTabs from "@/components/dashboard/ProfileTabs";
import AboutTab from "@/components/dashboard/AboutTab";
import SkillsTeachingTab from "@/components/dashboard/SkillsTeachingTab";
import SkillsLearningTab from "@/components/dashboard/SkillsLearningTab";
import ReviewsTab from "@/components/dashboard/ReviewsTab";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") ?? "about") as
    | "about"
    | "skills-teaching"
    | "skills-learning"
    | "reviews";

  return (
    <DashboardShell>
      <ProfileTabs active={tab} />
      {tab === "about" && <AboutTab />}
      {tab === "skills-teaching" && <SkillsTeachingTab />}
      {tab === "skills-learning" && <SkillsLearningTab />}
      {tab === "reviews" && <ReviewsTab />}
    </DashboardShell>
  );
}