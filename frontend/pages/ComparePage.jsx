import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CompareHeader from "../components/CompareHeader";
import CompareRadarChart from "../components/CompareRadarChart";
import CompareTable from "../components/CompareTable";
import { fetchDeveloperScore, fetchGithubStats } from "../services/api";
import { formatDateTime } from "../utils/date";

const GITHUB_USERNAME_REGEX = /^(?!-)(?!.*--)[a-zA-Z0-9-]{1,39}(?<!-)$/;

function getTimestamp(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function compareHigher(a, b) {
  if (a === b) return "tie";
  return a > b ? "A" : "B";
}

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [userAInput, setUserAInput] = useState("");
  const [userBInput, setUserBInput] = useState("");
  const [statsA, setStatsA] = useState(null);
  const [statsB, setStatsB] = useState(null);
  const [scoreA, setScoreA] = useState(null);
  const [scoreB, setScoreB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lastQueryRef = useRef("");

  const runComparison = async (userA, userB) => {
    if (!userA || !userB) {
      setError("Please enter both GitHub usernames.");
      return;
    }

    if (!GITHUB_USERNAME_REGEX.test(userA) || !GITHUB_USERNAME_REGEX.test(userB)) {
      setError("Enter valid GitHub usernames.");
      return;
    }

    if (userA.toLowerCase() === userB.toLowerCase()) {
      setError("Please enter two different GitHub usernames.");
      return;
    }

    const queryKey = `${userA.toLowerCase()}::${userB.toLowerCase()}`;
    if (lastQueryRef.current === queryKey) return;
    lastQueryRef.current = queryKey;

    try {
      setError("");
      setLoading(true);
      setStatsA(null);
      setStatsB(null);
      setScoreA(null);
      setScoreB(null);

      const [statsARes, statsBRes] = await Promise.all([
        fetchGithubStats(userA),
        fetchGithubStats(userB)
      ]);

      const [scoreARes, scoreBRes] = await Promise.all([
        fetchDeveloperScore(userA),
        fetchDeveloperScore(userB)
      ]);

      setStatsA(statsARes);
      setStatsB(statsBRes);
      setScoreA(scoreARes);
      setScoreB(scoreBRes);
    } catch (apiError) {
      const message =
        apiError?.response?.data?.error?.message ||
        apiError?.message ||
        "Failed to load comparison data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const userA = userAInput.trim();
    const userB = userBInput.trim();

    setSearchParams({ a: userA, b: userB });
    await runComparison(userA, userB);
  };

  useEffect(() => {
    const userA = (searchParams.get("a") || "").trim();
    const userB = (searchParams.get("b") || "").trim();

    if (userA) setUserAInput(userA);
    if (userB) setUserBInput(userB);

    if (!userA || !userB) return;
    runComparison(userA, userB);
  }, [searchParams]);

  const userAName = statsA?.username || userAInput.trim() || "User 1";
  const userBName = statsB?.username || userBInput.trim() || "User 2";

  const metrics = useMemo(() => {
    if (!statsA || !statsB) return [];

    const lastActiveA = getTimestamp(statsA?.lastActive);
    const lastActiveB = getTimestamp(statsB?.lastActive);

    return [
      {
        key: "repos",
        label: "Total Repositories",
        valueA: statsA?.totalRepos ?? 0,
        valueB: statsB?.totalRepos ?? 0,
        displayA: statsA?.totalRepos ?? 0,
        displayB: statsB?.totalRepos ?? 0,
        winner: compareHigher(statsA?.totalRepos ?? 0, statsB?.totalRepos ?? 0)
      },
      {
        key: "stars",
        label: "Total Stars",
        valueA: statsA?.totalStars ?? 0,
        valueB: statsB?.totalStars ?? 0,
        displayA: statsA?.totalStars ?? 0,
        displayB: statsB?.totalStars ?? 0,
        winner: compareHigher(statsA?.totalStars ?? 0, statsB?.totalStars ?? 0)
      },
      {
        key: "forks",
        label: "Total Forks",
        valueA: statsA?.totalForks ?? 0,
        valueB: statsB?.totalForks ?? 0,
        displayA: statsA?.totalForks ?? 0,
        displayB: statsB?.totalForks ?? 0,
        winner: compareHigher(statsA?.totalForks ?? 0, statsB?.totalForks ?? 0)
      },
      {
        key: "followers",
        label: "Followers",
        valueA: statsA?.followers ?? 0,
        valueB: statsB?.followers ?? 0,
        displayA: statsA?.followers ?? 0,
        displayB: statsB?.followers ?? 0,
        winner: compareHigher(statsA?.followers ?? 0, statsB?.followers ?? 0)
      },
      {
        key: "following",
        label: "Following",
        valueA: statsA?.following ?? 0,
        valueB: statsB?.following ?? 0,
        displayA: statsA?.following ?? 0,
        displayB: statsB?.following ?? 0,
        winner: compareHigher(statsA?.following ?? 0, statsB?.following ?? 0)
      },
      {
        key: "languages",
        label: "Languages Count",
        valueA: Object.keys(statsA?.languages || {}).length,
        valueB: Object.keys(statsB?.languages || {}).length,
        displayA: Object.keys(statsA?.languages || {}).length,
        displayB: Object.keys(statsB?.languages || {}).length,
        winner: compareHigher(
          Object.keys(statsA?.languages || {}).length,
          Object.keys(statsB?.languages || {}).length
        )
      },
      {
        key: "score",
        label: "Developer Score",
        valueA: scoreA?.score ?? 0,
        valueB: scoreB?.score ?? 0,
        displayA: scoreA?.score ?? 0,
        displayB: scoreB?.score ?? 0,
        winner: compareHigher(scoreA?.score ?? 0, scoreB?.score ?? 0)
      },
      {
        key: "lastActive",
        label: "Last Active",
        valueA: lastActiveA,
        valueB: lastActiveB,
        displayA: formatDateTime(statsA?.lastActive),
        displayB: formatDateTime(statsB?.lastActive),
        winner: compareHigher(lastActiveA, lastActiveB)
      }
    ];
  }, [statsA, statsB, scoreA, scoreB]);

  const overallWinner = useMemo(() => {
    if (!statsA || !statsB || !scoreA || !scoreB) return "";

    const scoreWinner = compareHigher(scoreA?.score ?? 0, scoreB?.score ?? 0);
    const starsWinner = compareHigher(statsA?.totalStars ?? 0, statsB?.totalStars ?? 0);
    const activityWinner = compareHigher(
      getTimestamp(statsA?.lastActive),
      getTimestamp(statsB?.lastActive)
    );

    const points = { A: 0, B: 0 };
    [scoreWinner, starsWinner, activityWinner].forEach((winner) => {
      if (winner === "A") points.A += 1;
      if (winner === "B") points.B += 1;
    });

    if (points.A === points.B) return "Tie";
    return points.A > points.B ? userAName : userBName;
  }, [statsA, statsB, scoreA, scoreB, userAName, userBName]);

  const isReady = Boolean(statsA && statsB && scoreA && scoreB);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <CompareHeader userA={userAName} userB={userBName} overallWinner={overallWinner} />

      <section className="glass-card glass-strong neon-border p-6">
        <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="text-sm font-semibold text-slate-300">
              First GitHub username
            </label>
            <div className="input-shell mt-2">
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
                value={userAInput}
                onChange={(e) => setUserAInput(e.target.value)}
                placeholder="e.g. torvalds"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-300">
              Second GitHub username
            </label>
            <div className="input-shell mt-2">
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
                value={userBInput}
                onChange={(e) => setUserBInput(e.target.value)}
                placeholder="e.g. gaearon"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="glow-button h-[52px] w-full rounded-2xl px-6 text-base font-semibold text-slate-900 lg:w-auto"
            >
              Compare
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
            {error}
          </p>
        )}
      </section>

      {loading && (
        <section className="mt-6">
          <div className="glass-card glass-strong p-8 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <div className="spinner-orbit" />
            </div>
            <p className="text-sm text-slate-300">Loading comparison...</p>
          </div>
        </section>
      )}

      {!loading && !isReady && !error && (
        <section className="mt-6">
          <div className="glass-card glass-strong p-8 text-center">
            <p className="text-sm text-slate-300">
              Enter two GitHub usernames to compare their profile performance.
            </p>
          </div>
        </section>
      )}

      {isReady && (
        <section className="mt-6 grid gap-6">
          <CompareTable metrics={metrics} userA={userAName} userB={userBName} />
          <CompareRadarChart
            statsA={statsA}
            statsB={statsB}
            scoreA={scoreA}
            scoreB={scoreB}
            userA={userAName}
            userB={userBName}
          />
        </section>
      )}
    </main>
  );
}
