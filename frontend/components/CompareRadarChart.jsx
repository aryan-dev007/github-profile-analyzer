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
  const tooltipContentStyle = {
    background: "rgba(8, 12, 20, 0.9)",
    border: "1px solid rgba(48, 242, 255, 0.45)",
    borderRadius: "14px",
    color: "#e2e8f0",
    boxShadow: "0 18px 40px rgba(3, 7, 18, 0.6)",
    backdropFilter: "blur(12px)"
  };
  const tooltipLabelStyle = {
    color: "#7dd3fc",
    fontWeight: 600
  };
  const tooltipItemStyle = {
    color: "#e2e8f0",
    fontWeight: 500
  };

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
    <div className="glass-card glass-strong neon-border card-hover p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Radar Comparison</h2>
        <p className="text-sm text-slate-300">
          Normalized metrics across activity, popularity, and reach.
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="rgba(148, 163, 184, 0.25)" />
            <PolarAngleAxis dataKey="category" tick={{ fill: "#cbd5f5", fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <Radar
              name={userAName}
              dataKey={userAName}
              stroke="#30f2ff"
              fill="#30f2ff"
              fillOpacity={0.2}
              isAnimationActive
            />
            <Radar
              name={userBName}
              dataKey={userBName}
              stroke="#ff5cdf"
              fill="#ff5cdf"
              fillOpacity={0.18}
              isAnimationActive
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
            />
            <Legend wrapperStyle={{ color: "#cbd5f5", fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
