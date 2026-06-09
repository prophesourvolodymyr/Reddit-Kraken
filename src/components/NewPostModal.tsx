import { useState } from "react";
import { Subreddit } from "../types";

interface NewPostModalProps {
  activeSub: Subreddit | null;
  onClose: () => void;
}

export default function NewPostModal({ activeSub, onClose }: NewPostModalProps) {
  const [postType, setPostType] = useState<"text" | "link" | "image">("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4">
          <h3 className="text-sm font-bold">
            New Post {activeSub ? `in r/${activeSub.name}` : ""}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          {!activeSub && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Subreddit</label>
              <select               className="w-full px-3 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer">
                <option>Select a subreddit...</option>
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
            <div className="flex gap-1">
              {(["text", "link", "image"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-colors capitalize ${
                    postType === type
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full px-3 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
            />
          </div>
          {(postType === "text" || postType === "link") && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {postType === "link" ? "URL" : "Body"}
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={postType === "link" ? "https://..." : "Post body..."}
                rows={6}
              className="w-full px-3 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground resize-none"
            />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!title}
              className="px-4 py-2 text-xs font-medium rounded-md bg-foreground text-background hover:opacity-90 disabled:opacity-30 cursor-pointer transition-opacity"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
