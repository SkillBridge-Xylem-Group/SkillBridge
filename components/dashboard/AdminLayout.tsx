import { type ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = "Admin";
  if (user) {
    const { data: row } = await supabase
      .from("users")
      .select("fullname")
      .eq("id", user.id)
      .maybeSingle();
    if (row?.fullname) displayName = row.fullname;
  }

  const { count: pendingReports } = await supabase
    .from("reports")
    .select("report_id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="flex min-h-screen bg-[#F7F7FB]">
      <AdminSidebar pendingReports={pendingReports ?? 0} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar userName={displayName} />
        <main className="flex-1 px-4 pb-16 sm:px-8 lg:px-10 lg:pb-10">{children}</main>
      </div>
    </div>
  );
}