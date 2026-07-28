import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminBadgesTable from "@/components/admin/AdminBadgesTable";

export const metadata: Metadata = {
  title: "Badges | Admin | SkillBridge",
};

export default async function AdminBadgesPage() {
  const supabase = await createSupabaseServerClient();

  const { data: badges } = await supabase
    .from("badges")
    .select("id, name, description, tier, icon, metric, target, sort_order, is_active")
    .order("sort_order");

  return (
    <div className="px-6 py-5 md:px-10 md:py-7">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--sb-ink)" }}>Badges</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--sb-muted)" }}>
        Manage achievement badges shown on member profiles.
      </p>

      <div className="mt-6">
        <AdminBadgesTable badges={badges ?? []} />
      </div>
    </div>
  );
}