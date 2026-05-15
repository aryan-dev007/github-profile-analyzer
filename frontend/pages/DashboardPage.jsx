import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
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

  const stagger = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08, duration: 0.5 }
    }
  };

  const fadeItem = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // 🔄 Loading UI
  if (loading) {
    return (
      <div className="relative z-10">
        <div className="app-header">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-emerald-300 to-pink-400 shadow-lg shadow-cyan-500/30" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">PulseBoard</p>
                <p className="glow-title text-lg font-semibold">Developer Analytics</p>
              </div>
            </div>
          </div>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-6">
            <div className="glass-card glass-strong card-hover p-6">
              <div className="h-6 w-1/3 animate-pulse rounded-full bg-white/10" />
              <div className="mt-4 h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
              <div className="mt-6 h-24 animate-pulse rounded-2xl bg-white/10" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="glass-card card-hover h-32 animate-pulse bg-white/10"
                />
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="spinner-orbit" />
              <div>
                <p className="text-sm font-semibold text-white">Loading dashboard</p>
                <p className="text-xs text-slate-300">Gathering GitHub stats and insights.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ❌ Error UI
  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="glass-card glass-strong p-8">
          <p className="text-lg font-semibold text-rose-200">{error}</p>
          <Link to="/" className="mt-4 inline-block text-cyan-200 underline">
            Go back
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="relative z-10">
      <div className="app-header">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-emerald-300 to-pink-400 shadow-lg shadow-cyan-500/30" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">PulseBoard</p>
              <p className="glow-title text-lg font-semibold">Developer Analytics</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Back
            </Link>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => {
                setCompareOpen(true);
                setCompareInput("");
                setCompareError("");
              }}
              className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Compare Profile
            </button>
            <ExportButton
              targetRef={reportRef}
              filename={`${stats?.username || "github"}-report.pdf`}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white">
            Dashboard: {stats?.username || "User"}
          </h1>
          <p className="text-sm text-slate-300">
            Snapshot of activity, impact, and growth.
          </p>
        </header>

      {compareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur">
          <div className="glass-card glass-strong neon-border w-full max-w-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Compare {stats?.username || username}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Enter another GitHub username to run a side-by-side comparison.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompareOpen(false)}
                className="text-sm text-slate-300 hover:text-white"
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
              <div className="input-shell">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  aria-hidden="true"
                  className="text-cyan-200"
                >
                  <path
                    fill="currentColor"
                    d="M10.5 3a7.5 7.5 0 015.97 12.04l3.75 3.75-1.42 1.41-3.75-3.74A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z"
                  />
                </svg>
                <input
                  type="text"
                  value={compareInput}
                  onChange={(event) => setCompareInput(event.target.value)}
                  placeholder="e.g. gaearon"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {compareError && (
                <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
                  {compareError}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompareOpen(false)}
                  className="rounded-2xl border border-slate-700/60 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-button rounded-2xl px-5 py-2 text-sm font-semibold text-slate-900"
                >
                  Compare Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <motion.section
        ref={reportRef}
        className="space-y-8"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <motion.div variants={fadeItem}>
            <ProfileCard user={stats} languages={stats?.languages || {}} />
          </motion.div>
          <motion.div variants={fadeItem}>
            <ScoreCard scoreData={scoreData} />
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div variants={fadeItem} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
        </motion.div>

        <motion.div variants={fadeItem} className="grid gap-6 lg:grid-cols-2">
          <ProjectHighlights repos={stats?.reposSummary || []} />
          <SmartTags
            repos={stats?.reposSummary || []}
            lastActive={stats?.lastActive}
            totalRepos={stats?.totalRepos}
          />
        </motion.div>

        {/* Top Repos */}
        <motion.div variants={fadeItem} className="glass-card glass-strong card-hover p-6">
          <h2 className="text-xl font-semibold text-white">
            Top Repositories (By Stars)
          </h2>

          {topRepos.length === 0 ? (
            <p className="mt-4 text-sm text-slate-300">No repositories found.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {topRepos.map((repo) => (
                <li key={repo.name} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-cyan-200 underline"
                  >
                    {repo.name}
                  </a>{" "}
                  <span className="text-slate-300">- ⭐ {repo.stars} | Forks: {repo.forks} | {repo.language || "N/A"}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div variants={fadeItem}>
          <AIInsightsCard insightsText={insightsText} errorMessage={aiError} isHeuristic={aiHeuristic} />
        </motion.div>

        {/* Charts */}
        <motion.div variants={fadeItem}>
          <ChartsPanel
            languages={stats?.languages || {}}
            activity={stats?.activityByMonth || []}
          />
        </motion.div>

        <motion.div variants={fadeItem}>
          <GrowthChart
            repoGrowth={stats?.repoGrowth || []}
            activity={stats?.activityByMonth || []}
          />
        </motion.div>

      </motion.section>
    </main>
    </div>
  );
}