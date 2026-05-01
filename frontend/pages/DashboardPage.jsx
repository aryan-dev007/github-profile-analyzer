import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AIInsightsCard from "../components/AIInsightsCard";
import ChartsPanel from "../components/ChartsPanel";
import ExportButton from "../components/ExportButton";
import GrowthChart from "../components/GrowthChart";
import ProfileCard from "../components/ProfileCard";
import ProjectHighlights from "../components/ProjectHighlights";
import ScoreCard from "../components/ScoreCard";
import SmartTags from "../components/SmartTags";
import StatCard from "../components/StatCard";
import ThemeToggle from "../components/ThemeToggle";
import {
  fetchAIInsights,
  fetchDeveloperScore,
  fetchGithubStats,
} from "../services/api";
import { formatDateTime } from "../utils/date";

export default function DashboardPage() {
  const { username } = useParams();
  const reportRef = useRef(null);
  const aiRequestTimeoutRef = useRef(null);
  const lastAiPayloadRef = useRef("");

  const [stats, setStats] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [insightsText, setInsightsText] = useState("");
  const [aiError, setAiError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;
    let isActive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        setAiError("");

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
          const payload = {
            repos: statsRes.totalRepos || 0,
            stars: statsRes.totalStars || 0,
            languages: Object.keys(statsRes.languages || {}),
          };
          const payloadKey = JSON.stringify({
            ...payload,
            languages: [...payload.languages].sort()
          });

          if (payloadKey === lastAiPayloadRef.current) {
            return;
          }
          lastAiPayloadRef.current = payloadKey;

          if (aiRequestTimeoutRef.current) {
            clearTimeout(aiRequestTimeoutRef.current);
          }

          await new Promise((resolve) => {
            aiRequestTimeoutRef.current = setTimeout(resolve, 400);
          });

          if (!isActive) return;

          const insightsRes = await fetchAIInsights(payload);

          if (!isActive) return;
          setInsightsText(insightsRes?.insights || insightsRes || "");
        } catch (aiError) {
          const aiMessage =
            aiError?.response?.data?.error?.message ||
            aiError?.message ||
            "AI insights service is currently unavailable.";
          if (isActive) {
            setInsightsText("");
            setAiError(aiMessage);
          }
        }
      } catch (apiError) {
        const message =
          apiError?.response?.data?.error?.message ||
          apiError?.message ||
          "Failed to load dashboard data.";
        setError(message);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      isActive = false;
      if (aiRequestTimeoutRef.current) {
        clearTimeout(aiRequestTimeoutRef.current);
      }
    };
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
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard: {stats?.username || "User"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            Snapshot of activity, impact, and growth.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle />
          <ExportButton
            targetRef={reportRef}
            filename={`${stats?.username || "github"}-report.pdf`}
          />
        </div>
      </header>

      <section ref={reportRef} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <ProfileCard user={stats} />
          <ScoreCard scoreData={scoreData} />
        </div>

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

        <div className="grid gap-6 lg:grid-cols-2">
          <ProjectHighlights repos={stats?.reposSummary || []} />
          <SmartTags
            repos={stats?.reposSummary || []}
            lastActive={stats?.lastActive}
            totalRepos={stats?.totalRepos}
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

        <AIInsightsCard insightsText={insightsText} errorMessage={aiError} />

        {/* Charts */}
        <ChartsPanel
          languages={stats?.languages || {}}
          activity={stats?.activityByMonth || []}
        />

        <GrowthChart
          repoGrowth={stats?.repoGrowth || []}
          activity={stats?.activityByMonth || []}
        />

      </section>
    </main>
  );
}