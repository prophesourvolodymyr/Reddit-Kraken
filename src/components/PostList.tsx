import { Post, Subreddit } from "../types";
import PostCard from "./PostCard";

interface PostListProps {
  activeSub: Subreddit | null;
  onPostClick: (post: Post) => void;
}

const demoPosts: Post[] = [
  {
    id: "p1", subreddit_id: "reactjs", title: "Why I switched from useEffect to useSyncExternalStore", body: "After 3 years of React, this one hook changed everything...", author: "devguy42", url: null, score: 342, num_comments: 56, created_utc: Date.now() / 1000 - 3600, flair_text: "Discussion", over_18: false, spoiler: false, fetched_at: "", status: "analyzed", relevance_score: 9,
  },
  {
    id: "p2", subreddit_id: "reactjs", title: "New React 19 patterns you should know", body: null, author: "reactfan", url: null, score: 128, num_comments: 23, created_utc: Date.now() / 1000 - 7200, flair_text: null, over_18: false, spoiler: false, fetched_at: "", status: "new", relevance_score: 7,
  },
  {
    id: "p3", subreddit_id: "python", title: "FastAPI vs Django: honest comparison after 2 years", body: "I've used both in production. Here's what nobody talks about...", author: "pydev99", url: null, score: 567, num_comments: 134, created_utc: Date.now() / 1000 - 5000, flair_text: "Resource", over_18: false, spoiler: false, fetched_at: "", status: "analyzed", relevance_score: 8,
  },
  {
    id: "p4", subreddit_id: "python", title: "I built a CLI tool that saves me 10 hours a week", body: null, author: "toolmaker", url: null, score: 89, num_comments: 12, created_utc: Date.now() / 1000 - 10000, flair_text: "Showcase", over_18: false, spoiler: false, fetched_at: "", status: "reviewed", relevance_score: 6,
  },
  {
    id: "p5", subreddit_id: "startups", title: "We hit $10k MRR. Here's what worked (and what didn't)", body: "18 months bootstrapped. No VC. Brutal lessons inside.", author: "foundermind", url: null, score: 892, num_comments: 210, created_utc: Date.now() / 1000 - 15000, flair_text: "AMA", over_18: false, spoiler: false, fetched_at: "", status: "drafted", relevance_score: 10,
  },
  {
    id: "p6", subreddit_id: "startups", title: "Cold email templates that got us 40% reply rate", body: null, author: "growthhacker", url: null, score: 445, num_comments: 87, created_utc: Date.now() / 1000 - 20000, flair_text: "Tips", over_18: false, spoiler: false, fetched_at: "", status: "analyzed", relevance_score: 8,
  },
  {
    id: "p7", subreddit_id: "javascript", title: "You don't need a state management library in 2026", body: "Between React Context, URL state, and server components...", author: "minimalistjs", url: null, score: 234, num_comments: 98, created_utc: Date.now() / 1000 - 25000, flair_text: null, over_18: false, spoiler: false, fetched_at: "", status: "new", relevance_score: 7,
  },
];

export default function PostList({ activeSub, onPostClick }: PostListProps) {
  const posts = demoPosts;
  const filteredPosts = activeSub
    ? posts.filter((p) => p.subreddit_id === activeSub.name)
    : posts;

  if (filteredPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-border">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <p className="text-sm font-medium">
          {activeSub
            ? "No posts yet. Check back soon."
            : "Add a subreddit to get started."}
        </p>
      </div>
    );
  }

  const sorted = [...filteredPosts].sort((a, b) => b.created_utc - a.created_utc);

  const groups: { subreddit: string; posts: Post[] }[] = [];
  for (const post of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.subreddit === post.subreddit_id) {
      last.posts.push(post);
    } else {
      groups.push({ subreddit: post.subreddit_id, posts: [post] });
    }
  }

  return (
    <div className="p-4 space-y-1">
      {groups.map((group, gi) => (
        <div key={gi}>
          {!activeSub && (
            <div className="flex items-center gap-2 px-1 py-3">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 py-1 rounded-full bg-card border border-border/30">
                r/{group.subreddit}
              </span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
          )}
          {group.posts.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => onPostClick(post)} />
          ))}
        </div>
      ))}
    </div>
  );
}
