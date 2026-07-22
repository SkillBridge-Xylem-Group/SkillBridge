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

  return (
    <div className="flex min-h-screen gap-4 bg-[#F7F7FB] p-4 lg:gap-6 lg:p-6">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar userName={displayName} />
        <main className="flex-1 pb-16 lg:pb-10">{children}</main>
      </div>
    </div>
  );
}