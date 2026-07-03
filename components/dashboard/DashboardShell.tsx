import { type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F7F7FB]">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <main className="px-6 pb-10 sm:px-10">{children}</main>
      </div>
    </div>
  );
}