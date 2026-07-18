import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getUserSessions } from "@/lib/sessionRequests";
import PendingRequestsList from "@/components/swap-requests/PendingRequestsList";
import SessionsTable from "@/components/swap-requests/SessionsTable";
import SessionsCalendar from "@/components/swap-requests/SessionsCalendar";

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
  const scheduledDates = sessions
    .filter((s) => s.scheduled_time && s.status !== "declined" && s.status !== "cancelled")
    .map((s) => s.scheduled_time as string);

  return (
    <DashboardLayout
      userName={viewerRow?.fullname ?? "there"}
      level={viewerRow?.level ?? 0}
      xp={viewerRow?.experience_points ?? 0}
    >
      <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SessionsTable sessions={otherSessions} />
        </div>

        <div className="space-y-6">
          <PendingRequestsList requests={pendingIncoming} />
          <SessionsCalendar scheduledDates={scheduledDates} />
        </div>
      </div>
    </DashboardLayout>
  );
}