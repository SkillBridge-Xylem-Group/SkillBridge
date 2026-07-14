import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getUserSessions } from "@/lib/sessionRequests";
import PendingRequestsList from "@/components/swap-requests/PendingRequestsList";
import SessionsTable from "@/components/swap-requests/SessionsTable";

export const metadata: Metadata = {
  title: "Swap Requests | SkillBridge",
};

export default async function SwapRequestsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: viewerRow } = await supabase
    .from("users")
    .select("fullname, level, experience_points")
    .eq("id", user.id)
    .maybeSingle();

  const sessions = await getUserSessions(supabase, user.id);
  const pendingIncoming = sessions.filter((s) => s.status === "pending" && !s.isRequester);
  const otherSessions = sessions.filter((s) => !(s.status === "pending" && !s.isRequester));

  return (
    <DashboardLayout
      userName={viewerRow?.fullname ?? "there"}
      level={viewerRow?.level ?? 0}
      xp={viewerRow?.experience_points ?? 0}
    >
      <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-extrabold text-slate-900">My Swap Requests</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              See all your incoming and outgoing skill swap requests, and manage your active connections.
            </p>
          </div>

          <SessionsTable sessions={otherSessions} />
        </div>

        <div className="space-y-6">
          <PendingRequestsList requests={pendingIncoming} />
        </div>
      </div>
    </DashboardLayout>
  );
}