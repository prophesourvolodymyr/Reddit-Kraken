export default function InboxView() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold">Messages</h3>
        <button className="px-3 py-1.5 text-xs font-medium bg-foreground text-background rounded-md hover:opacity-90 cursor-pointer transition-opacity">
          Compose
        </button>
      </div>
      <div className="flex items-center gap-1 mb-4">
        {["Inbox", "Unread", "Sent"].map((tab) => (
          <button
            key={tab}
            className={`px-3 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${
              tab === "Inbox"
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="pt-4">
        <p className="text-sm text-muted-foreground text-center py-12">No messages yet.</p>
      </div>
    </div>
  );
}
