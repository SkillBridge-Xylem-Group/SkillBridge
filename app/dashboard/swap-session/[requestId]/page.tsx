import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SwapSessionRoom from "@/components/swap-session/SwapSessionRoom";
import { getSwapSessionForUser } from "@/lib/swapSession";

export const metadata: Metadata = {
  title: "Skill Swap Session | SkillBridge",
};

type PageProps = {
  params: Promise<{ requestId: string }>;
};

export default async function SwapSessionPage({ params }: PageProps) {
  const { requestId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const session = await getSwapSessionForUser(supabase, requestId, user.id);
  if (!session) notFound();

  const { data: viewerRow } = await supabase
    .from("users")
    .select("fullname, level, experience_points")
    .eq("id", user.id)
    .maybeSingle();

  const viewerName = viewerRow?.fullname ?? "You";

  return (
    <DashboardLayout
      userName={viewerName}
      level={viewerRow?.level ?? 0}
      xp={viewerRow?.experience_points ?? 0}
    >
      <SwapSessionRoom session={session} userId={user.id} viewerName={viewerName} />
    </DashboardLayout>
  );
}
