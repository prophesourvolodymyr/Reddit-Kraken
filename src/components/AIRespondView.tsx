import { Post } from "../types";

interface AIRespondViewProps {
  onPostClick: (_post: Post) => void;
}

export default function AIRespondView({ onPostClick: _onPostClick }: AIRespondViewProps) {
  return (
    <div className="flex h-full">
      <div className="w-[320px] p-4 overflow-y-auto shrink-0">
        <h3 className="text-sm font-bold mb-3">Priority Queue</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#ff4500] mb-2">Critical</p>
            <p className="text-xs text-muted-foreground">No critical posts</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2">Suggested</p>
            <p className="text-xs text-muted-foreground">No suggested posts</p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col items-center justify-center text-muted-foreground gap-3">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-border">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <p className="text-sm font-medium">Select a post to analyze</p>
        <p className="text-xs text-muted-foreground/60">Posts with high relevance scores appear here for AI-assisted replies.</p>
      </div>
    </div>
  );
}
