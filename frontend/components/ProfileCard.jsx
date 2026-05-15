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

export default function ProfileCard({ user, languages = {} }) {
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
  const languageList = Object.keys(languages || {}).slice(0, 5);

  return (
    <div className="glass-card glass-strong neon-border card-hover relative overflow-hidden p-6">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        
        {/* Avatar */}
        {avatarSrc ? (
          <div className="rounded-full bg-gradient-to-br from-cyan-400 via-emerald-300 to-pink-400 p-0.5">
            <img
              src={avatarSrc}
              alt={displayName}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="h-20 w-20 rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/20 text-xl font-semibold text-cyan-100">
            {getInitials(user)}
          </div>
        )}

        {/* Main Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill bg-cyan-400/20 text-cyan-100">Developer Profile</span>
            {languageList.length > 0 && (
              <span className="pill bg-pink-500/20 text-pink-100">{languageList[0]}</span>
            )}
          </div>

          <h2 className="mt-1 text-2xl font-bold text-white">
            {displayName}
          </h2>

          <p className="mt-2 text-sm text-slate-300">{bio}</p>

          {/* Extra Info */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
            {location && <span>📍 {location}</span>}
            {company && <span>🏢 {company}</span>}
          </div>

          {/* Links */}
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {profileUrl && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100"
              >
                GitHub Profile
              </a>
            )}

            {blog && (
              <a
                href={blog.startsWith("http") ? blog : `https://${blog}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100"
              >
                Portfolio
              </a>
            )}
          </div>

          <p className="mt-3 text-xs font-medium text-slate-400">
            Joined {joinDate}
          </p>
        </div>

        {/* Followers */}
        <div className="flex gap-4 text-sm">
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-wide text-cyan-200">Followers</p>
            <p className="mt-1 text-lg font-semibold text-white">{followers}</p>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-white/5 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-300">Following</p>
            <p className="mt-1 text-lg font-semibold text-white">{following}</p>
          </div>
        </div>
      </div>
    </div>
  );
}