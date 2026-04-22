import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AIInsightsCard from "../components/AIInsightsCard";
import ChartsPanel from "../components/ChartsPanel";
import ExportButton from "../components/ExportButton";
import ScoreCard from "../components/ScoreCard";
import StatCard from "../components/StatCard";
import {
  fetchAIInsights,
  fetchDeveloperScore,
  fetchGithubStats,
} from "../services/api";
import { formatDateTime } from "../utils/date";

export default function DashboardPage() {
  const { username } = useParams();
  const reportRef = useRef(null);

  const [stats, setStats] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [insightsText, setInsightsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const aiFallbackText = [
    "Strengths:",
    "1. Consistent public repository activity.",
    "2. Good visibility through stars and forks.",
    "3. Healthy language diversity across projects.",
    "",
    "Weaknesses:",
    "1. AI insights service is currently unavailable.",
    "2. Deeper project-level context is temporarily missing.",
    "3. Automated qualitative analysis could not be generated.",
    "",
    "Improvements:",
    "1. Try again in a few minutes to regenerate AI insights.",
    "2. Verify Hugging Face API key and model availability.",
    "3. Continue using stats and score while AI service recovers."
  ].join("\n");

  function buildAIErrorFallback(message) {
    return [
      "Strengths:",
      "1. Core GitHub metrics and score are loaded successfully.",
      "2. Dashboard data remains available while AI retries.",
      "3. You can still export and review quantitative stats.",
      "",
      "Weaknesses:",
      `1. ${message || "AI insights request failed."}`,
      "2. Qualitative analysis could not be generated right now.",
      "3. AI provider may be rate-limited or temporarily unavailable.",
      "",
      "Improvements:",
      "1. Recheck Gemini API key and GEMINI_MODEL value in backend .env.",
      "2. Keep Hugging Face key configured for fallback behavior.",
      "3. Retry the dashboard after restarting backend server."
    ].join("\n");
  }

  useEffect(() => {
    if (!username) return;

    async function load() {
      try {
        setLoading(true);
        setError("");

        // 🔹 Fetch GitHub + Score together
        const [statsRes, scoreRes] = await Promise.all([
          fetchGithubStats(username),
          fetchDeveloperScore(username),
        ]);

        if (!statsRes) throw new Error("No data received from GitHub");

        setStats(statsRes);
        setScoreData(scoreRes);

        // 🔹 Fetch AI Insights (after stats ready)
        try {
          const insightsRes = await fetchAIInsights({
            repos: statsRes.totalRepos || 0,
            stars: statsRes.totalStars || 0,
            languages: Object.keys(statsRes.languages || {}),
          });

          setInsightsText(insightsRes?.insights || insightsRes || "");
        } catch (aiError) {
          const aiMessage =
            aiError?.response?.data?.error?.message ||
            aiError?.message ||
            "AI insights service is currently unavailable.";
          setInsightsText(buildAIErrorFallback(aiMessage));
        }
      } catch (apiError) {
        const message =
          apiError?.response?.data?.error?.message ||
          apiError?.message ||
          "Failed to load dashboard data.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [username]);

  const topRepos = useMemo(() => stats?.topRepos || [], [stats]);

  // 🔄 Loading UI
  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="glass-card p-10 text-center">
          <p className="animate-pulse text-lg font-medium">
            Fetching GitHub data...
          </p>
        </div>
      </main>
    );
  }

  // ❌ Error UI
  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="glass-card p-8">
          <p className="text-lg font-semibold text-rose-700">{error}</p>
          <Link to="/" className="mt-4 inline-block text-emerald-700 underline">
            Go back
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/" className="text-sm text-emerald-800 underline">
            Back
          </Link>
          <h1 className="mt-2 text-3xl font-bold">
            Dashboard: {stats?.username || "User"}
          </h1>
        </div>
        <ExportButton
          targetRef={reportRef}
          filename={`${stats?.username || "github"}-report.pdf`}
        />
      </header>

      <section ref={reportRef} className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total Repos" value={stats?.totalRepos ?? 0} delay={0} />
          <StatCard label="Total Stars" value={stats?.totalStars ?? 0} delay={60} />
          <StatCard label="Total Forks" value={stats?.totalForks ?? 0} delay={120} />
          <StatCard
            label="Languages"
            value={Object.keys(stats?.languages || {}).length}
            delay={180}
          />
          <StatCard
            label="Last Active"
            value={
              stats?.lastActive
                ? formatDateTime(stats.lastActive)
                : "N/A"
            }
            delay={240}
          />
        </div>

        {/* Top Repos */}
        <div className="glass-card p-6 fade-up">
          <h2 className="text-xl font-semibold">
            Top Repositories (By Stars)
          </h2>

          {topRepos.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No repositories found.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {topRepos.map((repo) => (
                <li key={repo.name} className="rounded-lg bg-white p-3">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-800 underline"
                  >
                    {repo.name}
                  </a>{" "}
                  - ⭐ {repo.stars} | Forks: {repo.forks} |{" "}
                  {repo.language || "N/A"}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Score */}
        <ScoreCard scoreData={scoreData} />

        {/* AI Insights */}
        <AIInsightsCard insightsText={insightsText} />

        {/* Charts */}
        <ChartsPanel
          languages={stats?.languages || {}}
          activity={stats?.activityByMonth || []}
        />
      </section>
    </main>
  );
}