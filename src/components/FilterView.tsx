import { useState } from "react";
import { Post } from "../types";

interface FilterViewProps {
  onPostClick: (_post: Post) => void;
}

export default function FilterView({ onPostClick: _onPostClick }: FilterViewProps) {
  const [query, setQuery] = useState("");

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, comments, authors..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
          />
        </div>
        <select className="px-3 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer">
          <option>All Subreddits</option>
        </select>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <select className="px-3 py-1.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer text-muted-foreground">
          <option>Date</option>
        </select>
        <select className="px-3 py-1.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer text-muted-foreground">
          <option>Score</option>
        </select>
        <select className="px-3 py-1.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer text-muted-foreground">
          <option>Status</option>
        </select>
        <button className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
          Clear
        </button>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-border">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        {query ? (
          <>
            <p className="text-sm font-medium">No posts match your search</p>
            <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
              Try broadening your filters or searching with different keywords.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium">No results yet</p>
            <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
              Use filters and search above to find posts. Results will appear here.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
