import { type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type DashboardLayoutProps = {
  children: ReactNode;
  userName?: string;
  avatarId?: string | null;
  level?: number;
  xp?: number;
};

export default function DashboardLayout({
  children,
  userName = "there",
  avatarId,
  level,
  xp,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F7F7FB]">
      <Sidebar />

      <div className="flex-1">
        <Topbar
          userName={userName}
          avatarId={avatarId}
          level={level != null ? `Level ${level}` : undefined}
          xp={xp}
        />
        <main className="px-6 pb-10 sm:px-10">{children}</main>
      </div>
    </div>
  );
}