import type { Metadata } from "next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BrowsePeopleGrid from "@/components/dashboard/BrowsePeopleGrid";

export const metadata: Metadata = {
  title: "Browse People | SkillBridge",
};

export default function BrowsePeoplePage() {
  return (
    <DashboardLayout>
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Browse People</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Find swap partners across the community to exchange skills. Use filters to match with people who offer what you want to learn.
        </p>
      </div>

      <BrowsePeopleGrid />
    </DashboardLayout>
  );
}