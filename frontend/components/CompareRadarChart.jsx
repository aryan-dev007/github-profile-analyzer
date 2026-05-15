import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

function getSafeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function normalizeMetric(value, max) {
  if (!max) return 0;
  return Math.round((value / max) * 100);
}

export default function CompareRadarChart({ statsA, statsB, scoreA, scoreB, userA, userB }) {
  const userAName = userA || "User 1";
  const userBName = userB || "User 2";

  const raw = [
    {
      key: "Activity",
      a: getSafeNumber(scoreA?.breakdown?.activity ?? 0),
      b: getSafeNumber(scoreB?.breakdown?.activity ?? 0)
    },
    {
      key: "Popularity",
      a: getSafeNumber(statsA?.totalStars ?? 0),
      b: getSafeNumber(statsB?.totalStars ?? 0)
    },
    {
      key: "Diversity",
      a: Object.keys(statsA?.languages || {}).length,
      b: Object.keys(statsB?.languages || {}).length
    },
    {
      key: "Repo Count",
      a: getSafeNumber(statsA?.totalRepos ?? 0),
      b: getSafeNumber(statsB?.totalRepos ?? 0)
    },
    {
      key: "Followers",
      a: getSafeNumber(statsA?.followers ?? 0),
      b: getSafeNumber(statsB?.followers ?? 0)
    }
  ];

  const data = raw.map((metric) => {
    const max = Math.max(metric.a, metric.b, 1);
    return {
      category: metric.key,
      [userAName]: normalizeMetric(metric.a, max),
      [userBName]: normalizeMetric(metric.b, max)
    };
  });

  return (
    <div className="glass-card card-hover border border-emerald-500/15 bg-white/80 p-6 dark:border-emerald-500/25 dark:bg-slate-900/80">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Radar Comparison</h2>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Normalized metrics across activity, popularity, and reach.
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="rgba(148, 163, 184, 0.4)" />
            <PolarAngleAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar
              name={userAName}
              dataKey={userAName}
              stroke="#0b6e4f"
              fill="#0b6e4f"
              fillOpacity={0.28}
              isAnimationActive
            />
            <Radar
              name={userBName}
              dataKey={userBName}
              stroke="#ef8f00"
              fill="#ef8f00"
              fillOpacity={0.2}
              isAnimationActive
            />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
