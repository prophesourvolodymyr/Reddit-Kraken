import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import PostList from "./components/PostList";
import FilterView from "./components/FilterView";
import AIRespondView from "./components/AIRespondView";
import InboxView from "./components/InboxView";
import PostDetail from "./components/PostDetail";
import FAB from "./components/FAB";
import NewPostModal from "./components/NewPostModal";
import SettingsPanel from "./components/SettingsPanel";
import { Subreddit, Post, ViewType, SidebarItem } from "./types";

export default function App() {
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>(
    getPlaceholderItems(),
  );
  const [activeSub, setActiveSub] = useState<Subreddit | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("general");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

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
      if (sourceIsRoot && adjustedToPath[0] > fromPath[0]) {
        adjustedToPath[0] -= 1;
      }
      if (
        fromPath.length === 2 &&
        adjustedToPath.length === 2 &&
        fromPath[0] === adjustedToPath[0] &&
        adjustedToPath[1] > fromPath[1]
      ) {
        adjustedToPath[1] -= 1;
      }

      if (adjustedToPath.length === 1) {
        const rootInsertIndex = Math.max(
          0,
          Math.min(adjustedToPath[0], items.length),
        );
        const sidebarItem =
          movedRootItem ??
          (movedSub
            ? { kind: "sub" as const, sub: movedSub, sortOrder: 0 }
            : null);
        if (!sidebarItem) return prev;
        items.splice(rootInsertIndex, 0, sidebarItem);
      } else if (adjustedToPath.length === 2) {
        const targetFolder = items[adjustedToPath[0]];
        if (!movedSub || !targetFolder || targetFolder.kind !== "folder")
          return prev;
        const subInsertIndex = Math.max(
          0,
          Math.min(adjustedToPath[1], targetFolder.subs.length),
        );
        targetFolder.subs.splice(subInsertIndex, 0, movedSub);
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
      const sourceRootItem = fromPath.length === 1 ? items[fromPath[0]] : null;
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
      if (fromPath.length === 1 && adjustedIntoPath[0] > fromPath[0]) {
        adjustedIntoPath[0] -= 1;
      }
      if (
        fromPath.length === 2 &&
        adjustedIntoPath.length === 2 &&
        fromPath[0] === adjustedIntoPath[0] &&
        adjustedIntoPath[1] > fromPath[1]
      ) {
        adjustedIntoPath[1] -= 1;
      }

      const targetRootItem = items[adjustedIntoPath[0]];
      if (!targetRootItem) return prev;

      if (adjustedIntoPath.length === 1 && targetRootItem.kind === "folder") {
        targetRootItem.subs.push(...draggedSubs);
        targetRootItem.expanded = true;
      } else if (
        adjustedIntoPath.length === 1 &&
        targetRootItem.kind === "sub"
      ) {
        const [targetSubItem] = items.splice(adjustedIntoPath[0], 1);
        if (!targetSubItem || targetSubItem.kind !== "sub") return prev;
        const folder: SidebarItem = {
          kind: "folder",
          id: `folder-${Date.now()}`,
          subs: [...draggedSubs, targetSubItem.sub],
          expanded: false,
          sortOrder: 0,
        };
        const insertAt =
          sourceRootItem && fromPath[0] < intoPath[0]
            ? adjustedIntoPath[0]
            : Math.min(adjustedIntoPath[0], fromPath[0]);
        items.splice(Math.max(0, Math.min(insertAt, items.length)), 0, folder);
      } else if (
        adjustedIntoPath.length === 2 &&
        targetRootItem.kind === "folder"
      ) {
        const insertAt = Math.max(
          0,
          Math.min(adjustedIntoPath[1], targetRootItem.subs.length),
        );
        targetRootItem.subs.splice(insertAt, 0, ...draggedSubs);
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
    setActiveView("general");
    setSelectedPost(null);
  };

  const handleSelectSub = (sub: Subreddit) => {
    setSidebarItems((prev) =>
      prev.map((item) => {
        if (item.kind === "sub" && item.sub.id === sub.id) {
          return {
            ...item,
            sub: { ...item.sub, has_new: false, unread_count: 0 },
          };
        }
        if (item.kind === "folder") {
          return {
            ...item,
            subs: item.subs.map((s) =>
              s.id === sub.id ? { ...s, has_new: false, unread_count: 0 } : s,
            ),
          };
        }
        return item;
      }),
    );
    setActiveSub(sub);
    setActiveView("general");
    setSelectedPost(null);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setActiveView("detail");
  };

  const handleBack = () => {
    setSelectedPost(null);
    setActiveView("general");
  };

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
          isHomeActive={activeSub === null && activeView === "general"}
          onAddSub={() => {}}
          onSettings={() => setShowSettings(true)}
        />
        <div className="flex flex-1 flex-col min-w-0 p-3 pl-0">
          <div className="flex flex-col flex-1 bg-card rounded-3xl overflow-hidden">
            <TopBar
              activeView={activeView}
              onViewChange={setActiveView}
              activeSub={activeSub}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {activeView === "general" && (
                <PostList activeSub={activeSub} onPostClick={handlePostClick} />
              )}
              {activeView === "filter" && (
                <FilterView onPostClick={handlePostClick} />
              )}
              {activeView === "ai-respond" && (
                <AIRespondView onPostClick={handlePostClick} />
              )}
              {activeView === "inbox" && <InboxView />}
              {activeView === "detail" && selectedPost && (
                <PostDetail post={selectedPost} onBack={handleBack} />
              )}
            </div>
          </div>
        </div>
        <FAB activeSub={activeSub} onClick={() => setShowNewPost(true)} />
        {showNewPost && (
          <NewPostModal
            activeSub={activeSub}
            onClose={() => setShowNewPost(false)}
          />
        )}
        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}
      </div>
    </div>
  );
}

function getPlaceholderItems(): SidebarItem[] {
  const now = new Date().toISOString();
  const makeSub = (
    name: string,
    index: number,
    unreadCount: number,
    accentColor: string,
  ): Subreddit => ({
    id: `placeholder-${name}`,
    name,
    icon_url: null,
    added_at: now,
    poll_interval: 15,
    enabled: true,
    sort_order: index,
    has_new: unreadCount > 0,
    unread_count: unreadCount,
    accent_color: accentColor,
  });

  const react = makeSub("reactjs", 0, 22, "#64d98a");
  const growthSubs = [
    makeSub("startups", 0, 31, "#f97316"),
    makeSub("indiehackers", 1, 23, "#f43f5e"),
    makeSub("marketing", 2, 18, "#f59e0b"),
    makeSub("design", 3, 30, "#ec4899"),
  ];
  const devSubs = [
    makeSub("python", 0, 3, "#3776ab"),
    makeSub("webdev", 1, 2, "#8b5cf6"),
    makeSub("javascript", 2, 4, "#f7df1e"),
    makeSub("rust", 3, 4, "#ce422b"),
  ];
  const aiSubs = [
    makeSub("aiagents", 0, 55, "#38bdf8"),
    makeSub("machinelearning", 1, 34, "#14b8a6"),
    makeSub("devops", 2, 17, "#22c55e"),
    makeSub("gamedev", 3, 10, "#a855f7"),
  ];

  return [
    { kind: "sub", sortOrder: 0, sub: react },
    {
      kind: "folder",
      id: "folder-growth",
      subs: growthSubs,
      expanded: false,
      sortOrder: 1,
    },
    {
      kind: "folder",
      id: "folder-dev",
      subs: devSubs,
      expanded: false,
      sortOrder: 2,
    },
    {
      kind: "folder",
      id: "folder-ai",
      subs: aiSubs,
      expanded: false,
      sortOrder: 3,
    },
  ];
}
