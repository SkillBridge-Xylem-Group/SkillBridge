import { type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import NotificationsPanel from "./NotificationsPanel";
import CommunityUpdates from "./CommunityUpdates";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F7F7FB]">
      <Sidebar />

      <div className="flex-1">
        <Topbar />
        <main className="px-6 pb-10 sm:px-10">{children}</main>
      </div>

      <aside className="hidden w-80 shrink-0 border-l border-slate-100 bg-white px-6 py-8 xl:block">
        <NotificationsPanel />
        <div className="mt-10">
          <CommunityUpdates />
        </div>
      </aside>
    </div>
  );
}