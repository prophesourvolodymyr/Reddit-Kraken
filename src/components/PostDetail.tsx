import { useState } from "react";
import { motion } from "motion/react";
import { Post, Comment } from "../types";

interface PostDetailProps {
  post: Post;
  comments: Comment[];
  onBack: () => void;
}

interface CommentNode extends Comment {
  children: CommentNode[];
}

function getTimeAgo(utc: number): string {
  const now = Date.now() / 1000;
  const diff = now - utc;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function fmtScore(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function buildCommentTree(comments: Comment[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];
  comments.forEach((c) => map.set(c.id, { ...c, children: [] }));
  comments.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) map.get(c.parent_id)!.children.push(node);
    else roots.push(node);
  });
  return roots;
}

function CommentItem({ comment, depth = 0 }: { comment: CommentNode; depth?: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const lineColor = ["#ff4500", "#7c6af2", "#22c55e", "#f59e0b", "#38bdf8"][depth % 5];

  return (
    <div className="relative">
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ backgroundColor: lineColor, opacity: collapsed ? 0.2 : 0.5 }} />
      )}
      <div className={`${depth > 0 ? "ml-4" : ""}`}>
        <div className="flex items-center gap-2 py-1.5">
          <button onClick={() => setCollapsed(!collapsed)} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            [{collapsed ? "+" : "−"}]
          </button>
          <span className="text-xs font-semibold text-muted-foreground">u/{comment.author}</span>
          <span className="text-[10px] text-muted-foreground/60">· {getTimeAgo(comment.created_utc)}</span>
          {comment.score > 0 && <span className="text-[10px] text-muted-foreground/60">· {comment.score} pts</span>}
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-foreground/80 mb-2 leading-relaxed">
            {comment.body}
          </motion.div>
        )}
        {!collapsed && (
          <div className="flex items-center gap-3 pb-2">
            <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-[#ff4500] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
            </button>
            <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-[#7c6af2] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <button className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Reply</button>
            <button className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Share</button>
            <button className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Report</button>
          </div>
        )}
        {!collapsed && comment.children.length > 0 && (
          <div className="space-y-0">
            {comment.children.map((child) => (
              <CommentItem key={child.id} comment={child as CommentNode} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostDetail({ post, comments, onBack }: PostDetailProps) {
  const [vote, setVote] = useState<0 | 1 | -1>(0);
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [copied, setCopied] = useState(false);
  const commentTree = buildCommentTree(comments);
  const score = post.score + vote;
  const timeAgo = getTimeAgo(post.created_utc);

  const handleShare = () => {
    const url = `https://reddit.com/r/${post.subreddit_id}/comments/${post.id}/`;
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}>
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-4 sm:px-5 pt-4 pb-3 cursor-pointer transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>

      <div className="max-w-3xl mx-auto px-2 sm:px-0">
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden mb-4">
        <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap text-xs mb-2">
            <span className="font-semibold text-[#ff4500]">r/{post.subreddit_id}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">u/{post.author}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{timeAgo}</span>
            {post.flair_text && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/5 border border-border/50 text-muted-foreground">{post.flair_text}</span>}
          </div>
          <h2 className="text-base sm:text-lg font-bold leading-snug">
            {post.title}
            {post.over_18 && <span className="ml-1.5 text-[10px] font-bold text-[#ff4500] border border-[#ff4500]/30 rounded px-1 py-px">NSFW</span>}
            {post.spoiler && <span className="ml-1.5 text-[10px] font-bold text-muted-foreground border border-border rounded px-1 py-px">SPOILER</span>}
          </h2>
        </div>

        {post.thumbnail_url && (
          <div className="w-full bg-secondary flex items-center justify-center">
            <img src={post.thumbnail_url} alt="" className="w-full max-h-[55vh] object-contain" />
          </div>
        )}

        {post.body && (
          <div className="px-4 sm:px-5 pb-4">
            <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{post.body}</div>
          </div>
        )}

        <div className="px-4 sm:px-5 py-2.5 border-t border-border/50 flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1 bg-secondary rounded-full px-2 py-1">
            <button onClick={() => setVote(vote === 1 ? 0 : 1)} className={`p-1 rounded transition-colors ${vote === 1 ? "text-[#ff4500]" : "text-muted-foreground hover:text-[#ff4500]"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={vote === 1 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
            </button>
            <span className={`text-xs font-bold tabular-nums ${vote === 1 ? "text-[#ff4500]" : vote === -1 ? "text-[#7c6af2]" : "text-muted-foreground"}`}>{fmtScore(score)}</span>
            <button onClick={() => setVote(vote === -1 ? 0 : -1)} className={`p-1 rounded transition-colors ${vote === -1 ? "text-[#7c6af2]" : "text-muted-foreground hover:text-[#7c6af2]"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={vote === -1 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            {post.num_comments} comments
          </span>
          <button onClick={handleShare} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
            {copied ? "Copied!" : "Share"}
          </button>
          <button onClick={() => setShowReply(!showReply)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            Reply
          </button>
        </div>
      </div>

      {showReply && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 rounded-2xl border border-border/50 bg-card p-4">
          <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="What are your thoughts?" rows={4} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground resize-none mb-3" />
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowReply(false); setReplyText(""); }} className="px-4 py-2 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors">Cancel</button>
            <button disabled={!replyText.trim()} className="px-4 py-2 text-xs font-medium rounded-lg bg-foreground text-background hover:opacity-90 disabled:opacity-30 cursor-pointer transition-opacity">Reply</button>
          </div>
        </motion.div>
      )}

      <div className="space-y-0">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-sm font-bold text-muted-foreground">{post.num_comments} Comments</span>
          <select className="text-xs bg-card border border-border rounded-lg px-2 py-1 text-muted-foreground cursor-pointer">
            <option>Best</option><option>Top</option><option>New</option><option>Controversial</option>
          </select>
        </div>
        {commentTree.map((comment) => <CommentItem key={comment.id} comment={comment} />)}
      </div>
      </div>
    </motion.div>
  );
}
