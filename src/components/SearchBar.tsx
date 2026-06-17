import { motion } from "motion/react";
import { Subreddit } from "../types";

interface SearchBarProps {
  activeSub: Subreddit | null;
  onClose: () => void;
}

export default function SearchBar({ activeSub, onClose }: SearchBarProps) {
  return (
    <motion.div
      className="px-4 pb-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <input
        type="text"
        autoFocus
        placeholder={activeSub ? `Search in r/${activeSub.name}...` : "Search posts..."}
        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      />
    </motion.div>
  );
}
