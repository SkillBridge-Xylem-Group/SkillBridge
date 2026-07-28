import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/dashboardShell";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";

export const metadata: Metadata = {
  title: "Notifications | Admin | SkillBridge",
};

export default async function AdminNotificationsPage() {
  const { user } = await getRequestUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="nb-card p-6">
        <NotificationsPanel />
      </div>
    </div>
  );
}