import { useState } from "react";
import { motion } from "motion/react";
import { invoke } from "@tauri-apps/api/core";
import { Subreddit } from "../types";

interface AddSubredditModalProps {
  onClose: () => void;
  onAdded: (sub: Subreddit) => void;
}

export default function AddSubredditModal({ onClose, onAdded }: AddSubredditModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      const sub = await invoke<Subreddit>("add_subreddit", { name: trimmed });
      onAdded(sub);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void handleAdd();
    if (e.key === "Escape") onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full max-w-md rounded-3xl border border-border bg-card text-foreground shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <h2 className="text-lg font-bold mb-2">Add Subreddit</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enter a subreddit name to add it to your sidebar.
        </p>

        <label className="block space-y-2 mb-4">
          <span className="text-sm font-semibold">Subreddit name</span>
          <div className="flex gap-2">
            <span className="flex items-center rounded-2xl border border-border bg-background px-3 py-3 text-sm text-muted-foreground">
              r/
            </span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
              placeholder="python"
              autoFocus
            />
          </div>
        </label>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={loading || !name.trim()}
            className="rounded-2xl bg-foreground px-5 py-2 text-sm font-bold text-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unexpected error adding subreddit";
}
