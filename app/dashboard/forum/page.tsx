import type { Metadata } from "next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata: Metadata = {
  title: "Community Forum | SkillBridge",
};

export default function ForumPage() {
  return (
    <DashboardLayout>
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Community Forum</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Browse forum posts, ask questions, and share knowledge with other members.
        </p>
      </div>
    </DashboardLayout>
  );
}
