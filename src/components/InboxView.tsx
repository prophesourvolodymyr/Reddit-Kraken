import { useState } from "react";

export default function InboxView() {
  const [activeTab, setActiveTab] = useState<"inbox" | "unread" | "sent">("inbox");

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold">Messages</h3>
        <button className="px-3 py-1.5 text-xs font-medium bg-foreground text-background rounded-lg hover:opacity-90 cursor-pointer transition-opacity">
          Compose
        </button>
      </div>
      <div className="flex items-center gap-1 mb-4">
        {(["inbox", "unread", "sent"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-colors capitalize ${
              activeTab === tab
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-border">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="text-sm font-medium">No messages</p>
        <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
          Private messages will appear here. Add your Reddit credentials in Settings to sync your inbox.
        </p>
      </div>
    </div>
  );
}
