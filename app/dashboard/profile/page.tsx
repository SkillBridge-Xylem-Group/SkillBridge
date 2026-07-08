import type { Metadata } from "next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata: Metadata = {
  title: "My Profile | SkillBridge",
};

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          This is your profile page. Add your skills, biography, and availability so the community can find you.
        </p>
      </div>
    </DashboardLayout>
  );
}
