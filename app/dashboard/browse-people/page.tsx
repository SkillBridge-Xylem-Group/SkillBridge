import type { Metadata } from "next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BrowsePeopleGrid from "@/components/dashboard/BrowsePeopleGrid";

export const metadata: Metadata = {
  title: "Browse People | SkillBridge",
};

export default function BrowsePeoplePage() {
  return (
    <DashboardLayout>
      <BrowsePeopleGrid />
    </DashboardLayout>
  );
}
