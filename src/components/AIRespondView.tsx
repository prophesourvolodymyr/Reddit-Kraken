import { useState, useEffect } from "react";
import { Post } from "../types";
import PostCard from "./PostCard";

interface AIRespondViewProps {
  onPostClick: (_post: Post) => void;
}

type LoadState = "empty" | "loading" | "loaded" | "error";

const SkeletonCard = () => (
  <div className="flex items-start gap-3 p-3 rounded-2xl border border-transparent animate-pulse">
    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-3 w-16 bg-border rounded-full" />
        <div className="h-3 w-10 bg-border rounded-full" />
      </div>
      <div className="h-4 w-3/4 bg-border rounded-md" />
      <div className="h-3 w-full bg-border rounded-md" />
      <div className="h-3 w-1/2 bg-border rounded-md" />
    </div>
  </div>
);

export default function AIRespondView({ onPostClick }: AIRespondViewProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    async function fetchPosts() {
      setLoadState("loading");
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const result = await invoke<Post[]>("get_worth_responding_posts");
        setPosts(result);
        setLoadState(result.length > 0 ? "loaded" : "empty");
      } catch {
        setLoadState("empty");
      }
    }
    fetchPosts();
  }, []);

  if (loadState === "loading") {
    return (
      <div className="p-4 space-y-1">
        <div className="flex items-center gap-2 mb-3 px-1 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#ff4500]">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <h3 className="text-sm font-bold">Worth Responding</h3>
        </div>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3 px-1 py-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#ff4500]">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <h3 className="text-sm font-bold">
          Worth Responding
          {posts.length > 0 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {posts.length} posts
            </span>
          )}
        </h3>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-border">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <p className="text-sm font-medium">No posts worth responding to right now</p>
          <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
            Posts flagged by AI will appear here. Add subreddits and configure an LLM provider to start.
          </p>
          <button className="px-4 py-2 text-xs rounded-xl border border-border hover:bg-secondary cursor-pointer transition-colors">
            Adjust interest profile
          </button>
        </div>
      ) : (
        <div className="space-y-0">
          {posts.map((post) => (
            <div key={post.id} className="rounded-2xl hover:bg-card/50 transition-colors duration-150">
              <PostCard post={post} onClick={() => onPostClick(post)} />
              <div className="px-3 pb-3 flex items-center gap-2">
                {post.ai_reason && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    {post.ai_reason}
                  </p>
                )}
                <div className="flex gap-1 ml-auto">
                  <button className="px-2 py-1 text-[10px] rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors">
                    Reply
                  </button>
                  <button className="px-2 py-1 text-[10px] rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors">
                    Dismiss
                  </button>
                  <button className="px-2 py-1 text-[10px] rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors">
                    Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
