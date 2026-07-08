import type { Metadata } from "next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata: Metadata = {
  title: "Swap Requests | SkillBridge",
};

export default function SwapRequestsPage() {
  return (
    <DashboardLayout>
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">My Swap Requests</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          See all your incoming and outgoing skill swap requests, and manage your active connections.
        </p>
      </div>
    </DashboardLayout>
  );
}
