import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
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
  const { supabase, user } = await getRequestUser();
  if (!user) redirect("/login");

  const session = await getSwapSessionForUser(supabase, requestId, user.id);
  if (!session) notFound();

  const { data: viewerRow } = await supabase
    .from("users")
    .select("fullname")
    .eq("id", user.id)
    .maybeSingle();

  const viewerName = viewerRow?.fullname ?? "You";

  return <SwapSessionRoom session={session} userId={user.id} viewerName={viewerName} />;
}
