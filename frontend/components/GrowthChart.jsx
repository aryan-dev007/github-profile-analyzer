import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

function hasSeriesData(series = []) {
  return Array.isArray(series) && series.length > 0;
}

const TOOLTIP_CONTENT_STYLE = {
  background: "rgba(8, 12, 20, 0.9)",
  border: "1px solid rgba(48, 242, 255, 0.45)",
  borderRadius: "14px",
  color: "#e2e8f0",
  boxShadow: "0 18px 40px rgba(3, 7, 18, 0.6)",
  backdropFilter: "blur(12px)"
};
const TOOLTIP_LABEL_STYLE = {
  color: "#7dd3fc",
  fontWeight: 600
};
const TOOLTIP_ITEM_STYLE = {
  color: "#e2e8f0",
  fontWeight: 500
};
const TOOLTIP_CURSOR_STYLE = {
  stroke: "rgba(48, 242, 255, 0.35)",
  strokeWidth: 1,
  fill: "rgba(48, 242, 255, 0.08)"
};

export default function GrowthChart({ repoGrowth = [], activity = [] }) {
  const hasRepoGrowth = hasSeriesData(repoGrowth);
  const hasActivity = hasSeriesData(activity);
  const hasAnyData = hasRepoGrowth || hasActivity;

  return (
    <div className="glass-card glass-strong neon-border card-hover p-6 fade-up">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-white">Growth Tracker</h2>
        <p className="text-sm text-slate-300">
          Track repository growth and activity over time.
        </p>
      </div>

      {!hasAnyData ? (
        <p className="mt-6 text-sm text-slate-300">No data available.</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Repository Growth
            </h3>
            <div className="mt-3 h-64">
              {hasRepoGrowth ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={repoGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={TOOLTIP_CONTENT_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      cursor={TOOLTIP_CURSOR_STYLE}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#6dff9e"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#6dff9e" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-300">No repository data.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-200">Activity Trend</h3>
            <div className="mt-3 h-64">
              {hasActivity ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={TOOLTIP_CONTENT_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      cursor={TOOLTIP_CURSOR_STYLE}
                    />
                    <Bar dataKey="count" fill="#ff5cdf" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-300">No activity data.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
