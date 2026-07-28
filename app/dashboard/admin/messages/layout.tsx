import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import ThreadList from "@/components/messages/ThreadList";
import MessagesShell from "@/components/messages/MessagesShell";
import { getUserThreads } from "@/lib/messages";

export const metadata: Metadata = {
  title: "Messages | Admin | SkillBridge",
};

export default async function AdminMessagesLayout({ children }: { children: ReactNode }) {
  const { supabase, user } = await getRequestUser();
  if (!user) redirect("/login");

  const threads = await getUserThreads(supabase, user.id);

  return <MessagesShell list={<ThreadList threads={threads} />}>{children}</MessagesShell>;
}