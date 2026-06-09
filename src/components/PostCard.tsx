import { Post } from "../types";

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

const statusBadge: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-500" },
  analyzed: { label: "Analyzed", color: "bg-purple-500" },
  reviewed: { label: "Reviewed", color: "bg-green-500" },
  drafted: { label: "Drafted", color: "bg-amber-500" },
  responded: { label: "Responded", color: "bg-emerald-500" },
  dismissed: { label: "Dismissed", color: "bg-gray-400" },
  archived: { label: "Archived", color: "bg-gray-500" },
};

export default function PostCard({ post, onClick }: PostCardProps) {
  const badge = statusBadge[post.status] || statusBadge.new;
  const timeAgo = getTimeAgo(post.created_utc);

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 p-3 rounded-2xl hover:bg-card border border-transparent hover:border-border cursor-pointer transition-all duration-150"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-[#ff4500]">r/{post.subreddit_id}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full text-white ${badge.color}`}>
            {badge.label}
          </span>
        </div>
        <h4 className="text-sm font-bold leading-snug truncate">{post.title}</h4>
        {post.body && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{post.body}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <span>Score: {post.score}</span>
          <span>{post.num_comments} comments</span>
          {post.relevance_score > 0 && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              {post.relevance_score}/10
            </span>
          )}
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mt-1 shrink-0">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );
}

function getTimeAgo(utc: number): string {
  const now = Date.now() / 1000;
  const diff = now - utc;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
