import { motion } from "motion/react";
import { Subreddit, ViewType, PostViewMode } from "../types";

interface TopBarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  activeSub: Subreddit | null;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  onOpenInbox: () => void;
  viewMode: PostViewMode;
  onViewModeChange: (mode: PostViewMode) => void;
}

export default function TopBar({
  activeView,
  onViewChange,
  activeSub,
  theme,
  onToggleTheme,
  showSearch,
  onToggleSearch,
  onOpenInbox,
  viewMode,
  onViewModeChange,
}: TopBarProps) {
  return (
    <div className="flex items-center h-10 sm:h-11 px-2 sm:px-4 gap-0.5 sm:gap-1 shrink-0">
      <motion.button
        onClick={() => onViewChange("for-you")}
        whileTap={{ scale: 0.94 }}
        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg sm:rounded-xl cursor-pointer transition-colors duration-200 ${
          activeView === "for-you"
            ? "bg-foreground text-background font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
      >
        For You
      </motion.button>
      <motion.button
        onClick={() => onViewChange("general")}
        whileTap={{ scale: 0.94 }}
        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg sm:rounded-xl cursor-pointer transition-colors duration-200 ${
          activeView === "general"
            ? "bg-foreground text-background font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
      >
        General
      </motion.button>
      {activeSub && (
        <div className="flex items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2">
          {activeSub.icon_url ? (
            <img src={activeSub.icon_url} alt={`r/${activeSub.name}`} className="h-6 w-6 sm:h-6 sm:w-6 rounded-[30%] object-cover" />
          ) : (
            <div className="h-6 w-6 sm:h-6 sm:w-6 flex items-center justify-center rounded-[30%] text-white font-black text-[9px] tracking-tight" style={{ backgroundColor: activeSub.accent_color || "#64748b" }}>
              {activeSub.name.split(/[-_]/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-xs sm:text-sm font-semibold">r/{activeSub.name}</span>
        </div>
      )}
      <div className="flex-1" />
      <div className="flex items-center gap-0.5 sm:gap-1 mr-1 sm:mr-2">
        <motion.button
          onClick={() => onViewModeChange("compact")}
          whileTap={{ scale: 0.94 }}
          className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg cursor-pointer transition-colors ${viewMode === "compact" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
          title="Compact view"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /></svg>
        </motion.button>
        <motion.button
          onClick={() => onViewModeChange("card")}
          whileTap={{ scale: 0.94 }}
          className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg cursor-pointer transition-colors ${viewMode === "card" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
          title="Card view"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="9" x2="9" y2="21" /></svg>
        </motion.button>
      </div>
      <button onClick={onToggleSearch} className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg cursor-pointer transition-colors duration-150 ${showSearch ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`} title="Search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
      <button onClick={onOpenInbox} className="p-1 sm:p-1.5 rounded-md sm:rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors duration-150" title="Inbox">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      <button onClick={onToggleTheme} className="p-1 sm:p-1.5 rounded-md sm:rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors duration-150" title={theme === "light" ? "Dark mode" : "Light mode"}>
        {theme === "light" ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </button>
    </div>
  );
}
