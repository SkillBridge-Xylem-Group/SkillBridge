import { type ReactNode } from "react";
import { getDashboardShellData } from "@/lib/dashboardShell";
import DashboardChrome from "./DashboardChrome";

type DashboardLayoutProps = {
  children: ReactNode;
  mainClassName?: string;
};

/** Server wrapper — fetches a thin shell, chrome persists on the client. */
export default async function DashboardLayout({
  children,
  mainClassName,
}: DashboardLayoutProps) {
  const shell = await getDashboardShellData();

  return (
    <DashboardChrome shell={shell} mainClassName={mainClassName}>
      {children}
    </DashboardChrome>
  );
}
