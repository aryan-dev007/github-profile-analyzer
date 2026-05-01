import { formatJoinDate } from "../utils/date";

function getDisplayName(user) {
  return user?.name || user?.username || "GitHub User";
}

function getAvatarSrc(user) {
  return user?.avatar_url || user?.avatarUrl || "";
}

function getInitials(user) {
  const name = getDisplayName(user);
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfileCard({ user }) {
  const displayName = getDisplayName(user);
  const avatarSrc = getAvatarSrc(user);

  const bio = user?.bio?.trim() || "No bio available";
  const followers = user?.followers ?? 0;
  const following = user?.following ?? 0;
  const joinDate = user?.created_at
    ? formatJoinDate(user.created_at)
    : "N/A";

  const location = user?.location;
  const company = user?.company;
  const blog = user?.blog;
  const profileUrl = user?.profileUrl;

  return (
    <div className="glass-card relative overflow-hidden border border-emerald-500/10 bg-white/80 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg dark:border-emerald-500/20 dark:bg-slate-900/80">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        
        {/* Avatar */}
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={displayName}
            className="h-20 w-20 rounded-full object-cover ring-2 ring-white/80 dark:ring-emerald-500/30"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
            {getInitials(user)}
          </div>
        )}

        {/* Main Info */}
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-200">
            Developer Profile
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {displayName}
          </h2>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{bio}</p>

          {/* Extra Info */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
            {location && <span>📍 {location}</span>}
            {company && <span>🏢 {company}</span>}
          </div>

          {/* Links */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            {profileUrl && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 underline dark:text-emerald-300"
              >
                GitHub Profile
              </a>
            )}

            {blog && (
              <a
                href={blog.startsWith("http") ? blog : `https://${blog}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline dark:text-sky-300"
              >
                Portfolio
              </a>
            )}
          </div>

          <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
            Joined {joinDate}
          </p>
        </div>

        {/* Followers */}
        <div className="flex gap-4 text-sm">
          <div className="rounded-xl bg-white/70 px-4 py-3 text-center shadow-sm dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Followers
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {followers}
            </p>
          </div>

          <div className="rounded-xl bg-white/70 px-4 py-3 text-center shadow-sm dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Following
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {following}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}