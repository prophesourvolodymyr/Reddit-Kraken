import { Subreddit } from "../types";

interface SubredditHeaderProps {
  sub: Subreddit;
}

function initials(name: string): string {
  return name
    .split(/[-_]/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function SubredditHeader({ sub }: SubredditHeaderProps) {
  const color = sub.accent_color || "#64748b";

  return (
    <div className="relative overflow-hidden mb-1">
      <div
        className="h-20 sm:h-24 md:h-28 transition-all"
        style={{
          background: `linear-gradient(135deg, ${color}22 0%, ${color}08 40%, transparent 100%)`,
        }}
      />
      <div className="absolute inset-0 flex items-end px-3 sm:px-4 md:px-5 pb-2 sm:pb-3 md:pb-4">
        <div className="flex items-end gap-2 sm:gap-3">
          {sub.icon_url ? (
            <img
              src={sub.icon_url}
              alt={`r/${sub.name}`}
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-[30%] object-cover ring-[3px] ring-card"
            />
          ) : (
            <div
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex items-center justify-center rounded-[30%] text-white font-black text-sm sm:text-base md:text-lg tracking-tight ring-[3px] ring-card"
              style={{ backgroundColor: color }}
            >
              {initials(sub.name)}
            </div>
          )}
          <div className="pb-0.5 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold truncate">
                r/{sub.name}
              </h2>
              {sub.subscribers && (
                <span className="text-[10px] sm:text-[11px] text-muted-foreground whitespace-nowrap">
                  {fmtNum(sub.subscribers)} members
                </span>
              )}
            </div>
            {sub.description && (
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-md sm:max-w-lg">
                {sub.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
