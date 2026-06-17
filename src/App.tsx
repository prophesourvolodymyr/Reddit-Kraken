import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import PostList from "./components/PostList";
import PostDetail from "./components/PostDetail";
import FAB from "./components/FAB";
import NewPostModal from "./components/NewPostModal";
import SettingsPanel from "./components/SettingsPanel";
import InboxView from "./components/InboxView";
import SearchBar from "./components/SearchBar";
import AddSubredditModal from "./components/AddSubredditModal";
import { Subreddit, Post, ViewType, SidebarItem, PostViewMode } from "./types";

export default function App() {
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [activeSub, setActiveSub] = useState<Subreddit | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("for-you");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);
  const [viewMode, setViewMode] = useState<PostViewMode>("compact");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isRedditConnected, setIsRedditConnected] = useState(false);
  const [sidebarLoaded, setSidebarLoaded] = useState(false);

  const contentKey = activeSub
    ? `${activeSub.id}-${activeView}`
    : activeView;

  const bleedRef = useRef<HTMLDivElement>(null);

  const loadSubreddits = async () => {
    try {
      const subs = await invoke<Subreddit[]>("get_subreddits");
      const items: SidebarItem[] = subs
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((sub, i) => ({ kind: "sub" as const, sub: { ...sub, sort_order: i }, sortOrder: i }));
      setSidebarItems(items);
      setSidebarLoaded(true);
    } catch {
      setSidebarLoaded(true);
    }
  };

  const checkRedditStatus = async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const status = await invoke<{ connected: boolean }>("get_reddit_status");
      setIsRedditConnected(status.connected);
    } catch {
      setIsRedditConnected(false);
    }
  };

  useEffect(() => {
    void loadSubreddits();
    void checkRedditStatus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showNewPost) setShowNewPost(false);
        if (showSettings) setShowSettings(false);
        if (showSearch) setShowSearch(false);
        if (showInbox) setShowInbox(false);
        if (showAddSub) setShowAddSub(false);
        if (selectedPost) setSelectedPost(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showNewPost, showSettings, showSearch, showInbox, showAddSub, selectedPost]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    document.documentElement.classList.toggle("dark");
  };

  const resyncSortOrders = (items: SidebarItem[]): SidebarItem[] =>
    items.map((item, i) => {
      if (item.kind === "sub")
        return { ...item, sortOrder: i, sub: { ...item.sub, sort_order: i } };
      return {
        ...item,
        sortOrder: i,
        subs: item.subs.map((s, si) => ({ ...s, sort_order: si })),
      };
    });

  const normalizeFolders = (items: SidebarItem[]): SidebarItem[] => {
    const normalized = items.flatMap((item): SidebarItem[] => {
      if (item.kind !== "folder") return [item];
      if (item.subs.length === 0) return [];
      if (item.subs.length === 1)
        return [{ kind: "sub", sub: item.subs[0], sortOrder: item.sortOrder }];
      return [item];
    });
    return resyncSortOrders(normalized);
  };

  const cloneSidebarItems = (items: SidebarItem[]): SidebarItem[] =>
    JSON.parse(JSON.stringify(items)) as SidebarItem[];

  const handleReorder = (fromPath: number[], toPath: number[]) => {
    setSidebarItems((prev) => {
      if (fromPath.join(",") === toPath.join(",")) return prev;
      const items = cloneSidebarItems(prev);
      const sourceIsRoot = fromPath.length === 1;
      const sourceRootItem = sourceIsRoot ? items[fromPath[0]] : null;
      if (!sourceRootItem && sourceIsRoot) return prev;
      if (sourceRootItem?.kind === "folder" && toPath.length !== 1) return prev;

      let movedRootItem: SidebarItem | null = null;
      let movedSub: Subreddit | null = null;

      if (sourceIsRoot) {
        const [removed] = items.splice(fromPath[0], 1);
        if (!removed) return prev;
        movedRootItem = removed;
        movedSub = removed.kind === "sub" ? removed.sub : null;
      } else if (fromPath.length === 2) {
        const sourceFolder = items[fromPath[0]];
        if (!sourceFolder || sourceFolder.kind !== "folder") return prev;
        const [removed] = sourceFolder.subs.splice(fromPath[1], 1);
        if (!removed) return prev;
        movedSub = removed;
      } else {
        return prev;
      }

      const adjustedToPath = [...toPath];
      if (sourceIsRoot && adjustedToPath[0] > fromPath[0]) adjustedToPath[0] -= 1;
      if (
        fromPath.length === 2 && adjustedToPath.length === 2 &&
        fromPath[0] === adjustedToPath[0] && adjustedToPath[1] > fromPath[1]
      ) {
        adjustedToPath[1] -= 1;
      }

      if (adjustedToPath.length === 1) {
        const idx = Math.max(0, Math.min(adjustedToPath[0], items.length));
        const sidebarItem = movedRootItem ?? (movedSub ? { kind: "sub" as const, sub: movedSub, sortOrder: 0 } : null);
        if (!sidebarItem) return prev;
        items.splice(idx, 0, sidebarItem);
      } else if (adjustedToPath.length === 2) {
        const targetFolder = items[adjustedToPath[0]];
        if (!movedSub || !targetFolder || targetFolder.kind !== "folder") return prev;
        targetFolder.subs.splice(
          Math.max(0, Math.min(adjustedToPath[1], targetFolder.subs.length)),
          0, movedSub,
        );
      } else {
        return prev;
      }
      return normalizeFolders(items);
    });
  };

  const handleMerge = (fromPath: number[], intoPath: number[]) => {
    setSidebarItems((prev) => {
      if (fromPath.join(",") === intoPath.join(",")) return prev;
      const items = cloneSidebarItems(prev);
      let draggedSubs: Subreddit[] = [];

      if (fromPath.length === 1) {
        const [removed] = items.splice(fromPath[0], 1);
        if (!removed) return prev;
        draggedSubs = removed.kind === "sub" ? [removed.sub] : removed.subs;
      } else if (fromPath.length === 2) {
        const sourceFolder = items[fromPath[0]];
        if (!sourceFolder || sourceFolder.kind !== "folder") return prev;
        const [removed] = sourceFolder.subs.splice(fromPath[1], 1);
        if (!removed) return prev;
        draggedSubs = [removed];
      } else {
        return prev;
      }

      const adjustedIntoPath = [...intoPath];
      if (fromPath.length === 1 && adjustedIntoPath[0] > fromPath[0]) adjustedIntoPath[0] -= 1;
      if (
        fromPath.length === 2 && adjustedIntoPath.length === 2 &&
        fromPath[0] === adjustedIntoPath[0] && adjustedIntoPath[1] > fromPath[1]
      ) {
        adjustedIntoPath[1] -= 1;
      }

      const targetRootItem = items[adjustedIntoPath[0]];
      if (!targetRootItem) return prev;

      if (adjustedIntoPath.length === 1 && targetRootItem.kind === "folder") {
        targetRootItem.subs.push(...draggedSubs);
        targetRootItem.expanded = true;
      } else if (adjustedIntoPath.length === 1 && targetRootItem.kind === "sub") {
        const [targetSubItem] = items.splice(adjustedIntoPath[0], 1);
        if (!targetSubItem || targetSubItem.kind !== "sub") return prev;
        const folder: SidebarItem = { kind: "folder", id: `folder-${Date.now()}`, subs: [...draggedSubs, targetSubItem.sub], expanded: false, sortOrder: 0 };
        items.splice(Math.max(0, Math.min(adjustedIntoPath[0], fromPath[0])), 0, folder);
      } else if (adjustedIntoPath.length === 2 && targetRootItem.kind === "folder") {
        targetRootItem.subs.splice(Math.max(0, Math.min(adjustedIntoPath[1], targetRootItem.subs.length)), 0, ...draggedSubs);
        targetRootItem.expanded = true;
      } else {
        return prev;
      }
      return normalizeFolders(items);
    });
  };

  const handleToggleFolder = (folderId: string) => {
    setSidebarItems((prev) =>
      prev.map((item) =>
        item.kind === "folder" && item.id === folderId
          ? { ...item, expanded: !item.expanded }
          : item,
      ),
    );
  };

  const handleHome = () => {
    setActiveSub(null);
    setActiveView("for-you");
    setSelectedPost(null);
  };

  const handleSelectSub = (sub: Subreddit) => {
    setSidebarItems((prev) =>
      prev.map((item) => {
        if (item.kind === "sub" && item.sub.id === sub.id)
          return { ...item, sub: { ...item.sub, has_new: false, unread_count: 0 } };
        if (item.kind === "folder")
          return { ...item, subs: item.subs.map((s) => s.id === sub.id ? { ...s, has_new: false, unread_count: 0 } : s) };
        return item;
      }),
    );
    setActiveSub(sub);
    setActiveView("general");
    setSelectedPost(null);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleBack = () => {
    setSelectedPost(null);
  };

  const handleAddSub = () => {
    setShowAddSub(true);
  };

  const handleSubAdded = (sub: Subreddit) => {
    setSidebarItems((prev) => {
      const maxOrder = prev.reduce((max, item) => {
        const order = item.kind === "sub" ? item.sub.sort_order : Math.max(...item.subs.map((s) => s.sort_order));
        return Math.max(max, order);
      }, -1);
      return [...prev, { kind: "sub" as const, sub: { ...sub, sort_order: maxOrder + 1 }, sortOrder: maxOrder + 1 }];
    });
    setShowAddSub(false);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
    void loadSubreddits();
    void checkRedditStatus();
  };

  if (!sidebarLoaded) {
    return null;
  }

  return (
    <div className={theme}>
      <div className="flex h-dvh w-screen overflow-hidden overscroll-none bg-background text-foreground">
        <Sidebar
          items={sidebarItems}
          activeSub={activeSub}
          onSelectSub={handleSelectSub}
          onReorder={handleReorder}
          onMerge={handleMerge}
          onToggleFolder={handleToggleFolder}
          onHome={handleHome}
          isHomeActive={activeSub === null && activeView === "for-you"}
          onAddSub={handleAddSub}
          onSettings={() => setShowSettings(true)}
        />
        <div className="flex flex-1 flex-col min-w-0 p-2 sm:p-3 pl-0 pt-0">
          <div className="flex flex-col flex-1 bg-card rounded-3xl overflow-hidden relative">
            {!selectedPost && (
              <>
                <div data-tauri-drag-region className="h-2 w-full shrink-0" />
                {activeSub && (
                  <motion.div
                    ref={bleedRef}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 32 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="shrink-0"
                    style={{
                      background: `linear-gradient(180deg, ${activeSub.accent_color || "#ff4500"}18 0%, transparent 100%)`,
                    }}
                  />
                )}
                <TopBar
                  activeView={activeView}
                  onViewChange={setActiveView}
                  activeSub={activeSub}
                  theme={theme}
                  onToggleTheme={toggleTheme}
                  showSearch={showSearch}
                  onToggleSearch={() => setShowSearch(!showSearch)}
                  onOpenInbox={() => setShowInbox(!showInbox)}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
                {showSearch && <SearchBar activeSub={activeSub} onClose={() => setShowSearch(false)} />}
              </>
            )}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <AnimatePresence mode="wait">
                <motion.div
                  key={contentKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="min-h-full"
                >
                  {showInbox ? (
                    <InboxView />
                  ) : selectedPost ? (
                    <PostDetail post={selectedPost} onBack={handleBack} />
                  ) : (
                    <PostList
                      activeSub={activeSub}
                      onPostClick={handlePostClick}
                      mode={activeView === "for-you" ? "digested" : "normal"}
                      viewMode={viewMode}
                      isRedditConnected={isRedditConnected}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        {!selectedPost && <FAB activeSub={activeSub} onClick={() => setShowNewPost(true)} />}
        <AnimatePresence>
          {showNewPost && (
            <NewPostModal activeSub={activeSub} onClose={() => setShowNewPost(false)} />
          )}
          {showSettings && (
            <SettingsPanel onClose={handleSettingsClose} />
          )}
          {showAddSub && (
            <AddSubredditModal
              onClose={() => setShowAddSub(false)}
              onAdded={handleSubAdded}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
