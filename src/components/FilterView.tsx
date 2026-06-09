import { Post } from "../types";

interface FilterViewProps {
  onPostClick: (_post: Post) => void;
}

export default function FilterView({ onPostClick: _onPostClick }: FilterViewProps) {
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
            placeholder="Search posts, comments, authors..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
          />
        </div>
        <select className="px-3 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer">
          <option>All Subreddits</option>
        </select>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <FilterDropdown label="Date" />
        <FilterDropdown label="Score" />
        <FilterDropdown label="Status" />
        <button className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
          Clear
        </button>
      </div>
      <div className="pt-4">
        <p className="text-sm text-muted-foreground text-center py-12">No results yet. Use filters above to search.</p>
      </div>
    </div>
  );
}

function FilterDropdown({ label }: { label: string }) {
  return (
    <select className="px-3 py-1.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer text-muted-foreground">
      <option>{label}</option>
    </select>
  );
}
