import { Post } from "../types";

interface PostDetailProps {
  post: Post;
  onBack: () => void;
}

export default function PostDetail({ post, onBack }: PostDetailProps) {
  return (
    <div className="p-4 max-w-3xl">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 cursor-pointer transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-[#ff4500]">r/{post.subreddit_id}</span>
        <span className="text-xs text-muted-foreground">· u/{post.author}</span>
      </div>
      <h2 className="text-lg font-bold mb-2">{post.title}</h2>
      {post.body && (
        <div className="text-sm text-foreground/80 mb-4 whitespace-pre-wrap">{post.body}</div>
      )}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6 pb-6">
        <span>Score: {post.score}</span>
        <span>{post.num_comments} comments</span>
        <span>Status: {post.status}</span>
      </div>
      <div className="text-sm text-muted-foreground text-center py-12">
        Comments will appear here (Cycle 3).
      </div>
    </div>
  );
}
