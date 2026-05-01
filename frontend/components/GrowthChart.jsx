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

export default function GrowthChart({ repoGrowth = [], activity = [] }) {
  const hasRepoGrowth = hasSeriesData(repoGrowth);
  const hasActivity = hasSeriesData(activity);
  const hasAnyData = hasRepoGrowth || hasActivity;

  return (
    <div className="glass-card p-6 fade-up">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Growth Tracker</h2>
        <p className="text-sm text-slate-500">
          Track repository growth and activity over time.
        </p>
      </div>

      {!hasAnyData ? (
        <p className="mt-6 text-sm text-slate-500">No data available.</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Repository Growth
            </h3>
            <div className="mt-3 h-64">
              {hasRepoGrowth ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={repoGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#0b6e4f"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500">No repository data.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700">Activity Trend</h3>
            <div className="mt-3 h-64">
              {hasActivity ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef8f00" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500">No activity data.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
