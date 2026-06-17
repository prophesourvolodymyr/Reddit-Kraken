import { motion } from "motion/react";
import { Subreddit } from "../types";

interface FABProps {
  activeSub: Subreddit | null;
  onClick: () => void;
}

export default function FAB({ activeSub, onClick }: FABProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-foreground text-background shadow-lg cursor-pointer flex items-center justify-center group z-50"
      title={activeSub ? `New post in r/${activeSub.name}` : "New post"}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs bg-card border border-border rounded-md shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {activeSub ? `New post in r/${activeSub.name}` : "New post"}
      </span>
    </motion.button>
  );
}
