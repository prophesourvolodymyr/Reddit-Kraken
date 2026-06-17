import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Post, PostViewMode } from "../types";
import ImageViewer from "./ImageViewer";

interface PostCardProps {
  post: Post;
  onClick: () => void;
  index?: number;
  mode?: PostViewMode;
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

function MetaLine({ post, timeAgo }: { post: Post; timeAgo: string }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap text-xs">
      <span className="font-semibold text-[#ff4500]">r/{post.subreddit_id}</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">u/{post.author}</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">{timeAgo}</span>
      {post.flair_text && (
        <>
          <span className="text-muted-foreground hidden sm:inline">·</span>
          <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/5 border border-border/50 text-muted-foreground">
            {post.flair_text}
          </span>
        </>
      )}
    </div>
  );
}

function ActionButtons({ post, onSave }: { post: Post; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-1 bg-secondary rounded-full px-2 py-1">
        <button onClick={(e) => e.stopPropagation()} className="p-0.5 rounded hover:bg-[#ff4500]/10 text-muted-foreground hover:text-[#ff4500] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
        </button>
        <span className="text-xs font-bold text-muted-foreground tabular-nums">{fmtScore(post.score)}</span>
        <button onClick={(e) => e.stopPropagation()} className="p-0.5 rounded hover:bg-[#7c6af2]/10 text-muted-foreground hover:text-[#7c6af2] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
      </div>
      <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        {post.num_comments}
      </button>
      <button onClick={(e) => { e.stopPropagation(); onSave(); }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill={post.saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
        {post.saved ? "Saved" : "Save"}
      </button>
      <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
        Share
      </button>
    </div>
  );
}

function PostImage({ src, alt }: { src: string; alt?: string }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  return (
    <>
      <div
        className="w-full bg-secondary flex items-center justify-center cursor-zoom-in overflow-hidden"
        onClick={(e) => { e.stopPropagation(); setViewerOpen(true); }}
      >
        <img src={src} alt={alt || ""} className="w-full max-h-[420px] object-contain rounded-xl m-2" loading="lazy" />
      </div>
      {viewerOpen && <ImageViewer src={src} alt={alt} onClose={() => setViewerOpen(false)} />}
    </>
  );
}

export default function PostCard({ post, onClick, index = 0, mode = "compact" }: PostCardProps) {
  const timeAgo = getTimeAgo(post.created_utc);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: true });

  const handleSave = () => {};

  if (mode === "card") {
    return (
      <motion.div
        ref={ref}
        onClick={onClick}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3), ease: "easeOut" }}
        className="group cursor-pointer rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-border transition-colors duration-200 mb-3"
      >
        <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
          <MetaLine post={post} timeAgo={timeAgo} />
          <h4 className="text-sm sm:text-base font-bold leading-snug mt-1.5 mb-1">
            {post.title}
            {post.over_18 && <span className="ml-1.5 text-[10px] font-bold text-[#ff4500] border border-[#ff4500]/30 rounded px-1 py-px">NSFW</span>}
            {post.spoiler && <span className="ml-1.5 text-[10px] font-bold text-muted-foreground border border-border rounded px-1 py-px">SPOILER</span>}
          </h4>
        </div>

        {post.thumbnail_url && <PostImage src={post.thumbnail_url} />}

        <div className="px-3 sm:px-4 py-2.5">
          <ActionButtons post={post} onSave={handleSave} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3), ease: "easeOut" }}
      className={`group cursor-pointer rounded-2xl border transition-colors duration-200 hover:bg-card ${
        post.worth_responding ? "border-[#ff4500]/20 hover:border-[#ff4500]/40" : "border-transparent hover:border-border"
      }`}
    >
      <div className="flex gap-0 p-2 sm:p-3">
        <div className="flex flex-col items-center gap-0.5 pt-1 shrink-0 w-8 sm:w-10">
          <button onClick={(e) => e.stopPropagation()} className="p-0.5 rounded hover:bg-[#ff4500]/10 text-muted-foreground hover:text-[#ff4500] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
          </button>
          <span className="text-[11px] sm:text-xs font-bold text-muted-foreground tabular-nums">{fmtScore(post.score)}</span>
          <button onClick={(e) => e.stopPropagation()} className="p-0.5 rounded hover:bg-[#7c6af2]/10 text-muted-foreground hover:text-[#7c6af2] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </div>
        {post.thumbnail_url && (
          <div
            className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-secondary border border-border/50 cursor-zoom-in"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <MetaLine post={post} timeAgo={timeAgo} />
          <h4 className="text-[13px] sm:text-sm font-bold leading-snug mt-0.5 mb-0.5">
            {post.title}
            {post.over_18 && <span className="ml-1.5 text-[10px] font-bold text-[#ff4500] border border-[#ff4500]/30 rounded px-1 py-px">NSFW</span>}
            {post.spoiler && <span className="ml-1.5 text-[10px] font-bold text-muted-foreground border border-border rounded px-1 py-px">SPOILER</span>}
          </h4>
          {post.body && <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{post.body}</p>}
          <div className="flex items-center gap-2 sm:gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              {post.num_comments}
            </span>
            {post.worth_responding && (
              <span className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#ff4500]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                Worth responding
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
