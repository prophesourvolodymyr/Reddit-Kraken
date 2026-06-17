import { useState, useEffect, useCallback } from "react";
import { Post, Subreddit, DigestGroup, PostViewMode } from "../types";
import PostCard from "./PostCard";

interface PostListProps {
  activeSub: Subreddit | null;
  onPostClick: (post: Post) => void;
  mode: "digested" | "normal";
  viewMode: PostViewMode;
  isRedditConnected: boolean;
}

type LoadState = "empty" | "loading" | "loaded" | "error";

const demoPosts: Post[] = [
  {
    id: "p1", subreddit_id: "reactjs", title: "Why I switched from useEffect to useSyncExternalStore", body: "After 3 years of React, this one hook changed everything...", author: "devguy42", url: null, thumbnail_url: null, score: 342, num_comments: 56, created_utc: Date.now() / 1000 - 3600, flair_text: "Discussion", over_18: false, spoiler: false, fetched_at: "", seen: false, saved: false, worth_responding: true, ai_reason: "They're asking about React patterns — your exact expertise.", archived: false,
  },
  {
    id: "p2", subreddit_id: "reactjs", title: "New React 19 patterns you should know", body: null, author: "reactfan", url: null, thumbnail_url: null, score: 128, num_comments: 23, created_utc: Date.now() / 1000 - 7200, flair_text: null, over_18: false, spoiler: false, fetched_at: "", seen: false, saved: false, worth_responding: false, ai_reason: null, archived: false,
  },
  {
    id: "p3", subreddit_id: "python", title: "FastAPI vs Django: honest comparison after 2 years", body: "I've used both in production. Here's what nobody talks about...", author: "pydev99", url: null, thumbnail_url: null, score: 567, num_comments: 134, created_utc: Date.now() / 1000 - 5000, flair_text: "Resource", over_18: false, spoiler: false, fetched_at: "", seen: false, saved: false, worth_responding: true, ai_reason: "Python ecosystem comparison matches your profile.", archived: false,
  },
  {
    id: "p4", subreddit_id: "python", title: "I built a CLI tool that saves me 10 hours a week", body: null, author: "toolmaker", url: null, thumbnail_url: "https://picsum.photos/seed/cli/200/200", score: 89, num_comments: 12, created_utc: Date.now() / 1000 - 10000, flair_text: "Showcase", over_18: false, spoiler: false, fetched_at: "", seen: false, saved: false, worth_responding: false, ai_reason: null, archived: false,
  },
  {
    id: "p5", subreddit_id: "startups", title: "We hit $10k MRR. Here's what worked (and what didn't)", body: "18 months bootstrapped. No VC. Brutal lessons inside.", author: "foundermind", url: null, thumbnail_url: "https://picsum.photos/seed/startup/200/200", score: 892, num_comments: 210, created_utc: Date.now() / 1000 - 15000, flair_text: "AMA", over_18: false, spoiler: false, fetched_at: "", seen: false, saved: false, worth_responding: true, ai_reason: "This is your market — you can add real value here.", archived: false,
  },
  {
    id: "p6", subreddit_id: "startups", title: "Cold email templates that got us 40% reply rate", body: null, author: "growthhacker", url: null, thumbnail_url: null, score: 445, num_comments: 87, created_utc: Date.now() / 1000 - 20000, flair_text: "Tips", over_18: false, spoiler: false, fetched_at: "", seen: false, saved: false, worth_responding: false, ai_reason: null, archived: false,
  },
  {
    id: "p7", subreddit_id: "javascript", title: "You don't need a state management library in 2026", body: "Between React Context, URL state, and server components...", author: "minimalistjs", url: null, thumbnail_url: "https://picsum.photos/seed/js/200/200", score: 234, num_comments: 98, created_utc: Date.now() / 1000 - 25000, flair_text: null, over_18: false, spoiler: false, fetched_at: "", seen: false, saved: false, worth_responding: true, ai_reason: "State management debate — you have strong opinions here.", archived: false,
  },
];

const EmptyState = ({
  message,
  subtext,
  svg,
}: {
  message: string;
  subtext?: string;
  svg: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 p-8">
    {svg}
    <p className="text-sm font-medium">{message}</p>
    {subtext && <p className="text-xs text-muted-foreground/60">{subtext}</p>}
  </div>
);

const EmptyDocSvg = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-border">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const SkeletonCard = ({ mode }: { mode: PostViewMode }) => {
  if (mode === "card") {
    return (
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden mb-2 animate-pulse">
        <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 space-y-2">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-16 bg-border rounded-full" />
            <div className="h-3 w-24 bg-border rounded-full" />
            <div className="h-3 w-10 bg-border rounded-full" />
          </div>
          <div className="h-5 w-3/4 bg-border rounded-md" />
        </div>
        <div className="w-full aspect-video bg-border/30" />
        <div className="px-3 sm:px-4 py-2 flex items-center gap-3 sm:gap-4">
          <div className="h-7 w-16 bg-border rounded-full" />
          <div className="h-5 w-12 bg-border rounded-full" />
          <div className="h-5 w-14 bg-border rounded-full" />
          <div className="h-5 w-14 bg-border rounded-full ml-auto" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-0 p-2 sm:p-3 animate-pulse">
      <div className="flex flex-col items-center gap-1 pt-1 shrink-0 w-8 sm:w-10">
        <div className="h-3 w-3 bg-border rounded" />
        <div className="h-3 w-5 bg-border rounded" />
        <div className="h-3 w-3 bg-border rounded" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-16 bg-border rounded-full" />
          <div className="h-3 w-24 bg-border rounded-full" />
          <div className="h-3 w-10 bg-border rounded-full" />
        </div>
        <div className="h-4 w-3/4 bg-border rounded-md" />
        <div className="h-3 w-full bg-border rounded-md" />
        <div className="h-3 w-1/2 bg-border rounded-md" />
      </div>
    </div>
  );
};

function getDateLabel(utc: number): string {
  const date = new Date(utc * 1000);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function buildDigestedGroups(posts: Post[]): DigestGroup[] {
  const sorted = [...posts].sort((a, b) => b.created_utc - a.created_utc);
  const groups: DigestGroup[] = [];
  const seen = new Set<string>();

  for (const post of sorted) {
    const key = `${getDateLabel(post.created_utc)}|${post.subreddit_id}`;
    if (seen.has(key)) {
      const existing = groups.find(
        (g) => g.date_label + "|" + g.subreddit === key,
      );
      if (existing) existing.posts.push(post);
      continue;
    }
    seen.add(key);
    groups.push({
      date_label: getDateLabel(post.created_utc),
      subreddit: post.subreddit_id,
      posts: [post],
    });
  }

  return groups;
}

function groupBySub(posts: Post[]): { subreddit: string; posts: Post[] }[] {
  const sorted = [...posts].sort((a, b) => b.created_utc - a.created_utc);
  const groups: { subreddit: string; posts: Post[] }[] = [];
  for (const post of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.subreddit === post.subreddit_id) {
      last.posts.push(post);
    } else {
      groups.push({ subreddit: post.subreddit_id, posts: [post] });
    }
  }
  return groups;
}

export default function PostList({
  activeSub,
  onPostClick,
  mode,
  viewMode,
  isRedditConnected,
}: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("empty");

  const fetchPosts = useCallback(async () => {
    setLoadState("loading");
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const command = isRedditConnected ? "fetch_posts_live" : "get_posts";
      const result = await invoke<Post[]>(command, {
        subredditId: activeSub?.id ?? null,
      });
      if (result.length > 0) {
        setPosts(result);
        setLoadState("loaded");
        return;
      }
    } catch {
      // Backend not available, fall through
    }
    if (isRedditConnected) {
      setPosts([]);
      setLoadState("empty");
      return;
    }
    const filtered = activeSub
      ? demoPosts.filter((p) => p.subreddit_id === activeSub.name)
      : demoPosts;
    setPosts(filtered);
    setLoadState(filtered.length > 0 ? "loaded" : "empty");
  }, [activeSub, isRedditConnected]);

  useEffect(() => {
    void fetchPosts();
    if (!isRedditConnected) return;
    const interval = setInterval(() => void fetchPosts(), 15000);
    return () => clearInterval(interval);
  }, [activeSub, isRedditConnected]);

  if (loadState === "loading") {
    return (
      <div className="p-2 sm:p-4 space-y-2">
        <SkeletonCard mode={viewMode} />
        <SkeletonCard mode={viewMode} />
        <SkeletonCard mode={viewMode} />
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 p-8">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-sm font-medium text-red-400">Failed to load posts</p>
        <button
          onClick={() => {
            setLoadState("loading");
            setTimeout(() => setLoadState("empty"), 600);
          }}
          className="px-4 py-2 text-xs rounded-xl border border-border hover:bg-secondary cursor-pointer transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loadState === "empty") {
    return (
      <div className="p-2 sm:p-4">
        <EmptyState
          message={
            activeSub
              ? "No posts yet. Check back soon."
              : "No posts yet. Add a subreddit to get started."
          }
          subtext={
            activeSub
              ? `r/${activeSub.name} will auto-refresh every ${activeSub.poll_interval} minutes.`
              : "Click the + button in the sidebar to add your first subreddit."
          }
          svg={<EmptyDocSvg />}
        />
      </div>
    );
  }

  if (mode === "normal" || activeSub) {
    const groups = groupBySub(posts);

    return (
      <div className="p-2 sm:p-4 space-y-1">
        {groups.map((group, gi) => (
          <div key={gi}>
            {!activeSub && (
              <div className="flex items-center gap-2 px-1 py-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  r/{group.subreddit}
                </span>
              </div>
            )}
            {group.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => onPostClick(post)}
                index={gi}
                mode={viewMode}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const groups = buildDigestedGroups(posts);

  return (
    <div className="p-2 sm:p-4 space-y-1">
      {groups.length === 0 ? (
        <EmptyState
          message="No posts worth responding to right now."
          subtext="Posts flagged by AI will appear here. Add subreddits and configure an LLM provider to start."
          svg={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-border">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          }
        />
      ) : (
        groups.map((group, gi) => (
          <div key={gi} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-muted-foreground">
                {group.date_label}
              </span>
              <span className="text-[10px] text-muted-foreground/50">
                — r/{group.subreddit}
              </span>
            </div>
            <div className="space-y-0">
              {group.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => onPostClick(post)}
                  index={gi}
                  mode={viewMode}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
