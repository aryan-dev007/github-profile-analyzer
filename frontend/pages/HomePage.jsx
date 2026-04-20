import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GITHUB_USERNAME_REGEX = /^(?!-)(?!.*--)[a-zA-Z0-9-]{1,39}(?<!-)$/;

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const trimmed = username.trim();

    if (!trimmed) {
      setError("Please enter a GitHub username");
      return;
    }

    if (!GITHUB_USERNAME_REGEX.test(trimmed)) {
      setError("Enter a valid GitHub username");
      return;
    }

    setError("");
    navigate(`/dashboard/${encodeURIComponent(trimmed)}`);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-12">
      <section className="glass-card w-full p-8 md:p-12 fade-up">
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-700">
          GitHub Profile Analyzer
        </p>

        <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
          Inspect developer impact with stats, AI insights, and a shareable PDF report.
        </h1>

        <p className="mt-4 text-slate-600">
          Enter a GitHub username to generate repository analytics, developer score,
          visual charts, and structured recommendations.
        </p>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            name="githubUsername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. torvalds"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none ring-emerald-300 transition focus:ring"
          />

          <button
            type="submit"
            className="rounded-xl bg-emerald-700 px-5 py-3 font-medium text-white transition hover:bg-emerald-600"
          >
            Analyze Profile
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>
    </main>
  );
}