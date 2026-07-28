import type { DashboardStatItem } from "@/lib/dashboardStats";

type StatCardProps = Omit<DashboardStatItem, "id">;

function StatCard({ icon: Icon, value, label, delta, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="nb-card-sm flex items-center gap-4 p-5">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{ background: iconBg, color: iconColor }}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-tight nb-heading">{value}</p>
        <p className="truncate text-sm font-semibold" style={{ color: "var(--sb-muted)" }}>
          {label}
        </p>
        {delta && (
          <p className="mt-0.5 text-xs font-bold" style={{ color: "var(--sb-emerald-dark)" }}>
            {delta}
          </p>
        )}
      </div>
    </div>
  );
}

type DashboardStatsGridProps = {
  stats: DashboardStatItem[];
};

export default function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ id, ...cardProps }) => (
        <StatCard key={id} {...cardProps} />
      ))}
    </div>
  );
}
