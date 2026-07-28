import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Skill Swaps | Admin | SkillBridge",
};

const STATUS_TABS = ["all", "pending", "accepted", "rescheduled", "completed", "declined", "cancelled"] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-teal-50 text-teal-700",
  rescheduled: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  declined: "bg-red-50 text-red-600",
  cancelled: "bg-slate-100 text-slate-500",
};

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

function formatDateTime(value: string | null) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminSwapHistoryPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams;
  const status = STATUS_TABS.includes(statusParam as (typeof STATUS_TABS)[number]) ? statusParam! : "all";

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("session_requests")
    .select("request_id, requester_id, receiver_id, status, scheduled_time, completed_at, created_at")
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data: sessions, error } = await query;
  const sessionList = sessions ?? [];

  const userIds = [
    ...new Set(sessionList.flatMap((s) => [s.requester_id, s.receiver_id])),
  ];

  const { data: users } = userIds.length
    ? await supabase.from("users").select("id, fullname, avatar_url").in("id", userIds)
    : { data: [] as { id: string; fullname: string; avatar_url: string | null }[] };

  const userById = new Map((users ?? []).map((u) => [u.id, u]));

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-semibold text-gray-900">Skill Swaps</h1>
      <p className="mt-1 text-sm text-gray-500">
        Read-only view of every swap session on the platform — {sessionList.length} total
        {status !== "all" ? ` · ${status}` : ""}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab}
            href={tab === "all" ? "/dashboard/swap-requests" : `/dashboard/swap-requests?status=${tab}`}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              status === tab ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-100"
            }`}
          >
            {tab}
          </Link>
        ))}
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Failed to load swap sessions: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Requester</th>
              <th className="px-4 py-3">Receiver</th>
              <th className="px-4 py-3">Scheduled</th>
              <th className="px-4 py-3">Completed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {sessionList.map((s) => {
              const requester = userById.get(s.requester_id);
              const receiver = userById.get(s.receiver_id);
              return (
                <tr key={s.request_id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 text-xs">
                        {requester?.avatar_url && <AvatarImage src={requester.avatar_url} alt="" />}
                        <AvatarFallback className="font-bold text-white" style={{ background: "var(--sb-gradient)" }}>
                          {getInitials(requester?.fullname ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-slate-900">{requester?.fullname ?? "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 text-xs">
                        {receiver?.avatar_url && <AvatarImage src={receiver.avatar_url} alt="" />}
                        <AvatarFallback className="font-bold text-white" style={{ background: "var(--sb-gradient)" }}>
                          {getInitials(receiver?.fullname ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-slate-900">{receiver?.fullname ?? "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(s.scheduled_time)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(s.completed_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[s.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
            {sessionList.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No swap sessions{status !== "all" ? ` with status "${status}"` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}