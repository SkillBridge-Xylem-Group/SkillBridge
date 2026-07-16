import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThreadList from "@/components/messages/ThreadList";
import MessagesShell from "@/components/messages/MessagesShell";
import { getUserThreads } from "@/lib/messages";

export const metadata: Metadata = {
  title: "Messages | SkillBridge",
};

export default async function MessagesLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: viewerRow } = await supabase
    .from("users")
    .select("fullname, level, experience_points")
    .eq("id", user.id)
    .maybeSingle();

  const threads = await getUserThreads(supabase, user.id);

  return (
    <DashboardLayout
      userName={viewerRow?.fullname ?? "there"}
      level={viewerRow?.level ?? 0}
      xp={viewerRow?.experience_points ?? 0}
    >
      <MessagesShell list={<ThreadList threads={threads} />}>{children}</MessagesShell>
    </DashboardLayout>
  );
}
