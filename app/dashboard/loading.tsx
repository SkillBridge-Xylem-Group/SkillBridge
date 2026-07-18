export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-4 pt-2">
      <div className="h-8 w-48 rounded-lg bg-slate-200/80" />
      <div className="h-40 rounded-2xl bg-slate-200/60" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-2xl bg-slate-200/60" />
        <div className="h-28 rounded-2xl bg-slate-200/60" />
      </div>
    </div>
  );
}
