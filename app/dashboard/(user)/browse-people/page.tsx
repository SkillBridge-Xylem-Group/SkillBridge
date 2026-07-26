import type { Metadata } from "next";
import BrowsePeopleGrid from "@/components/dashboard/BrowsePeopleGrid";

export const metadata: Metadata = {
  title: "Browse People | SkillBridge",
};

export default function BrowsePeoplePage() {
  return <BrowsePeopleGrid />;
}
