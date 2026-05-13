import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const aiRequestTimeoutRef = useRef(null);
  const lastAiPayloadRef = useRef("");

  const [stats, setStats] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [insightsText, setInsightsText] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiHeuristic, setAiHeuristic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareInput, setCompareInput] = useState("");
  const [compareError, setCompareError] = useState("");

  const GITHUB_USERNAME_REGEX = /^(?!-)(?!.*--)[a-zA-Z0-9-]{1,39}(?<!-)$/;

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
            aiRequestTimeoutRef.current = setTimeout(resolve, 1500);
          });

          if (!isActive) return;

          const insightsRes = await fetchAIInsights(payload);

          if (!isActive) return;
          // support both shapes (string or { insights, heuristic })
          const text = insightsRes?.insights ?? insightsRes ?? "";
          setInsightsText(text);
          setAiHeuristic(Boolean(insightsRes?.heuristic));
        } catch (aiError) {
          const tried = aiError?.message || aiError?.tried || aiError?.cause?.message;
          const aiMessage =
            aiError?.response?.data?.error?.message ||
            (typeof tried === "string" ? tried : aiError?.message) ||
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
          <button
            type="button"
            onClick={() => {
              setCompareOpen(true);
              setCompareInput("");
              setCompareError("");
            }}
            className="rounded-2xl border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-500/30 dark:bg-slate-900/70 dark:text-emerald-200"
          >
            Compare Profile
          </button>
          <ExportButton
            targetRef={reportRef}
            filename={`${stats?.username || "github"}-report.pdf`}
          />
        </div>
      </header>

      {compareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="glass-card w-full max-w-lg border border-emerald-500/20 bg-white/90 p-6 dark:bg-slate-900/90">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Compare {stats?.username || username}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  Enter another GitHub username to run a side-by-side comparison.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompareOpen(false)}
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>

            <form
              className="mt-4 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();

                const currentUser = (stats?.username || username || "").trim();
                const otherUser = compareInput.trim();

                if (!otherUser) {
                  setCompareError("Please enter another GitHub username.");
                  return;
                }

                if (!GITHUB_USERNAME_REGEX.test(otherUser)) {
                  setCompareError("Enter a valid GitHub username.");
                  return;
                }

                if (currentUser.toLowerCase() === otherUser.toLowerCase()) {
                  setCompareError("Please enter a different GitHub username.");
                  return;
                }

                setCompareError("");
                setCompareOpen(false);
                navigate(
                  `/compare?a=${encodeURIComponent(currentUser)}&b=${encodeURIComponent(
                    otherUser
                  )}`
                );
              }}
              noValidate
            >
              <input
                type="text"
                value={compareInput}
                onChange={(event) => setCompareInput(event.target.value)}
                placeholder="e.g. gaearon"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none ring-emerald-300 transition focus:ring dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
              />

              {compareError && <p className="text-sm text-red-600">{compareError}</p>}

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompareOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-button rounded-2xl px-5 py-2 text-sm font-semibold text-white"
                >
                  Compare Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

        <AIInsightsCard insightsText={insightsText} errorMessage={aiError} isHeuristic={aiHeuristic} />

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