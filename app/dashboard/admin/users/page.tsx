import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SuspendToggleButton from "@/components/admin/SuspendToggleButton";

export const metadata: Metadata = {
  title: "Users | Admin | SkillBridge",
};

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("users")
    .select("id, email, fullname, role, trust_score, level, created_at, is_suspended")
    .neq("id", user?.id ?? "")
    .order("created_at", { ascending: false });

  const term = q?.trim().replace(/[,()%]/g, "");
  if (term) {
    query = query.or(`fullname.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const { data: users, error } = await query;
  const count = users?.length ?? 0;

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
      <p className="mt-1 text-sm text-gray-500">
        {count} user{count === 1 ? "" : "s"}
        {term ? ` matching "${term}"` : ""}
      </p>

      <form method="GET" className="mt-6 flex flex-wrap gap-2">
        <input
          type="text"
          name="q"
          defaultValue={term ?? ""}
          placeholder="Search by name or email"
          className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Search
        </button>
        {term && (
          <a
            href="/dashboard/admin/users"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Clear
          </a>
        )}
      </form>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Failed to load users: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Trust score</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-900">{u.fullname}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3 text-slate-500">{u.trust_score ?? 0}</td>
                <td className="px-4 py-3 text-slate-500">{u.level}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {u.is_suspended ? (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                      Suspended
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <SuspendToggleButton userId={u.id} isSuspended={u.is_suspended} />
                </td>
              </tr>
            ))}
            {count === 0 && !error && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}