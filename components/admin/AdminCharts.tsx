type TrendDatum = {
  label: string;
  signups: number;
  sessions: number;
};

export function TrendBarChart({ buckets, showEveryLabel = true }: { buckets: TrendDatum[]; showEveryLabel?: boolean }) {
  const width = 640;
  const height = 220;
  const paddingLeft = 26;
  const paddingRight = 12;
  const paddingTop = 10;
  const paddingBottom = 24;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxRaw = Math.max(1, ...buckets.map((w) => Math.max(w.signups, w.sessions)));
  const gridSteps = 4;
  const niceMax = Math.max(gridSteps, Math.ceil(maxRaw / gridSteps) * gridSteps);

  const baselineY = paddingTop + chartHeight;
  const yFor = (v: number) => baselineY - (v / niceMax) * chartHeight;

  const groupWidth = chartWidth / Math.max(buckets.length, 1);
  const barWidth = Math.max(4, Math.min(16, groupWidth * 0.26));
  const labelStep = showEveryLabel ? 1 : Math.ceil(buckets.length / 8);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="New signups and completed sessions over time"
    >
      {Array.from({ length: gridSteps + 1 }).map((_, i) => {
        const value = (niceMax / gridSteps) * i;
        const y = yFor(value);
        return (
          <g key={i}>
            <line x1={paddingLeft} x2={width - paddingRight} y1={y} y2={y} stroke="#eef1f4" strokeWidth={1} />
            <text x={0} y={y + 3} fontSize="9" fill="var(--color-mid-gray)">
              {value}
            </text>
          </g>
        );
      })}

      {buckets.map((w, i) => {
        const groupCenter = paddingLeft + i * groupWidth + groupWidth / 2;
        const signupsY = yFor(w.signups);
        const sessionsY = yFor(w.sessions);
        return (
          <g key={`${w.label}-${i}`}>
            <rect
              x={groupCenter - barWidth - 2}
              y={signupsY}
              width={barWidth}
              height={Math.max(baselineY - signupsY, 0)}
              rx={2}
              fill="var(--color-brand-blue)"
            />
            <rect
              x={groupCenter + 2}
              y={sessionsY}
              width={barWidth}
              height={Math.max(baselineY - sessionsY, 0)}
              rx={2}
              fill="var(--color-brand-green)"
            />
            {i % labelStep === 0 && (
              <text x={groupCenter} y={height - 6} fontSize="9" textAnchor="middle" fill="var(--color-mid-gray)">
                {w.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

/**
 * Ring chart built from stacked stroked circles — donut effect without a
 * charting library. Server component, static markup only.
 */
export function DonutChart({ segments, centerLabel }: { segments: DonutSegment[]; centerLabel?: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const r = 60;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * r;
  let cumulativeFraction = 0;

  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#f1f2f4" strokeWidth={strokeWidth} />
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s) => {
              const fraction = s.value / total;
              const dash = fraction * circumference;
              const offset = -cumulativeFraction * circumference;
              cumulativeFraction += fraction;
              return (
                <circle
                  key={s.label}
                  cx="80"
                  cy="80"
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={offset}
                />
              );
            })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-carbon">{total}</span>
        {centerLabel && <span className="text-[10px] font-medium text-mid-gray">{centerLabel}</span>}
      </div>
    </div>
  );
}