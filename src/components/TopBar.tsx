import { Subreddit, ViewType } from "../types";

interface TopBarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  activeSub: Subreddit | null;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const tabs: { id: ViewType; label: string }[] = [
  { id: "general", label: "General" },
  { id: "filter", label: "Filter/Search" },
  { id: "ai-respond", label: "AI Respond" },
  { id: "inbox", label: "Inbox" },
];

export default function TopBar({ activeView, onViewChange, activeSub, theme, onToggleTheme }: TopBarProps) {
  return (
    <div className="flex items-center h-11 px-4 gap-4 shrink-0">
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`px-3 py-1.5 text-sm rounded-xl cursor-pointer transition-colors duration-150 ${
              activeView === tab.id
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1" />
      {activeSub && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#ff450020", color: "#ff4500" }}>
            r/
          </div>
          <span className="font-medium text-foreground">{activeSub.name}</span>
        </div>
      )}
      <button
        onClick={onToggleTheme}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors duration-150"
        title={theme === "light" ? "Dark mode" : "Light mode"}
      >
        {theme === "light" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </button>
    </div>
  );
}
