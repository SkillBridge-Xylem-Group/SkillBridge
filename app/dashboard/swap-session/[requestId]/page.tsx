import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getDashboardShellData, getRequestUser } from "@/lib/dashboardShell";
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

  const [session, shell] = await Promise.all([
    getSwapSessionForUser(supabase, requestId, user.id),
    getDashboardShellData(),
  ]);

  if (!session) notFound();

  return (
    <SwapSessionRoom
      session={session}
      userId={user.id}
      viewerName={shell.userName || "You"}
      viewerAvatarUrl={shell.avatarUrl}
    />
  );
}
