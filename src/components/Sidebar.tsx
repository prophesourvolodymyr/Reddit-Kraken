import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Subreddit, SidebarItem } from "../types";

interface SidebarProps {
  items: SidebarItem[];
  activeSub: Subreddit | null;
  onSelectSub: (sub: Subreddit) => void;
  onReorder: (fromPath: number[], toPath: number[]) => void;
  onMerge: (fromPath: number[], intoPath: number[]) => void;
  onToggleFolder: (folderId: string) => void;
  onHome: () => void;
  isHomeActive: boolean;
  onAddSub: () => void;
  onSettings: () => void;
}

const SUB_COLORS: Record<string, string> = {
  reactjs: "#64d98a",
  startups: "#f97316",
  python: "#3776ab",
  webdev: "#8b5cf6",
  javascript: "#f7df1e",
  rust: "#ce422b",
  aiagents: "#38bdf8",
  indiehackers: "#f43f5e",
  devops: "#22c55e",
  design: "#ec4899",
  marketing: "#f59e0b",
  gamedev: "#a855f7",
  machinelearning: "#14b8a6",
};

interface DragPreviewData {
  kind: "sub" | "folder";
  sub?: Subreddit;
  subs?: Subreddit[];
}

interface DragSession {
  path: number[];
  preview: DragPreviewData;
  pointerId: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  hasMoved: boolean;
  onTap: () => void;
}

interface IndicatorPosition {
  top: number;
  left: number;
  width: number;
}

type DropHit =
  | {
      action: "merge";
      path: number[];
      targetPath: number[];
    }
  | {
      action: "reorder";
      path: number[];
      indicator: IndicatorPosition;
    };

interface DropCandidate {
  path: number[];
  kind: string;
  rect: DOMRect;
}

function subColor(sub: Subreddit): string {
  return sub.accent_color || SUB_COLORS[sub.name] || "#64748b";
}

function pathsEqual(a: number[] | null | undefined, b: number[]): boolean {
  return Boolean(
    a && a.length === b.length && a.every((part, i) => part === b[i]),
  );
}

function pathStartsWith(path: number[], parent: number[]): boolean {
  return parent.every((part, i) => path[i] === part);
}

function parsePath(value: string | undefined): number[] | null {
  if (!value) return null;
  const path = value.split(",").map((part) => Number(part));
  return path.every((part) => Number.isInteger(part) && part >= 0)
    ? path
    : null;
}

function incrementPath(path: number[]): number[] {
  const next = [...path];
  next[next.length - 1] += 1;
  return next;
}

function unreadCount(sub: Subreddit): number {
  return sub.unread_count ?? (sub.has_new ? 1 : 0);
}

function folderUnreadCount(subs: Subreddit[]): number {
  return subs.reduce((total, sub) => total + unreadCount(sub), 0);
}

function sidebarUnreadCount(items: SidebarItem[]): number {
  return items.reduce((total, item) => {
    if (item.kind === "sub") return total + unreadCount(item.sub);
    return total + folderUnreadCount(item.subs);
  }, 0);
}

function formatUnread(count: number): string {
  if (count > 99) return "99+";
  return String(count);
}

function initials(name: string): string {
  return name
    .split(/[-_]/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function activityDotClass(size: "normal" | "small"): string {
  return size === "normal" ? "-left-1 h-1.5 w-1.5" : "left-0 h-1 w-1";
}

function indicatorFromRect(
  rect: DOMRect,
  edge: "before" | "after" | "center",
): IndicatorPosition {
  const top =
    edge === "center"
      ? rect.top + rect.height / 2
      : edge === "before"
        ? rect.top - 5
        : rect.bottom + 5;

  return {
    top,
    left: rect.left + 13,
    width: Math.max(34, rect.width - 26),
  };
}

export default function Sidebar({
  items,
  activeSub,
  onSelectSub,
  onReorder,
  onMerge,
  onToggleFolder,
  onHome,
  isHomeActive,
  onAddSub,
  onSettings,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement | null>(null);
  const dragSessionRef = useRef<DragSession | null>(null);
  const [activeDrag, setActiveDrag] = useState<DragSession | null>(null);
  const [dropHit, setDropHit] = useState<DropHit | null>(null);

  useEffect(() => {
    if (!activeDrag) return;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [activeDrag]);

  const isInvalidTarget = (dragPath: number[], targetPath: number[]) => {
    if (pathsEqual(dragPath, targetPath)) return true;
    return dragPath.length === 1 && pathStartsWith(targetPath, dragPath);
  };

  const findDropHit = (
    clientX: number,
    clientY: number,
    dragPath: number[],
  ): DropHit | null => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return null;

    const candidates: DropCandidate[] = Array.from(
      sidebar.querySelectorAll<HTMLElement>("[data-drop-path]"),
    )
      .map((element) => {
        const path = parsePath(element.dataset.dropPath);
        if (!path || isInvalidTarget(dragPath, path)) return null;
        return {
          path,
          kind: element.dataset.dropKind || "item",
          rect: element.getBoundingClientRect(),
        };
      })
      .filter((candidate): candidate is DropCandidate => candidate !== null);

    const containing = candidates
      .filter(
        ({ rect }) =>
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom,
      )
      .sort(
        (a, b) => a.rect.width * a.rect.height - b.rect.width * b.rect.height,
      )[0];

    if (containing) {
      if (containing.kind.endsWith("end")) {
        return {
          action: "reorder",
          path: containing.path,
          indicator: indicatorFromRect(containing.rect, "center"),
        };
      }

      const centerY = containing.rect.top + containing.rect.height / 2;
      const mergeBand = Math.min(18, containing.rect.height * 0.34);
      if (Math.abs(clientY - centerY) <= mergeBand) {
        return {
          action: "merge",
          path: containing.path,
          targetPath: containing.path,
        };
      }

      const before = clientY < centerY;
      return {
        action: "reorder",
        path: before ? containing.path : incrementPath(containing.path),
        indicator: indicatorFromRect(
          containing.rect,
          before ? "before" : "after",
        ),
      };
    }

    const sidebarRect = sidebar.getBoundingClientRect();
    if (
      clientX < sidebarRect.left - 18 ||
      clientX > sidebarRect.right + 18 ||
      clientY < sidebarRect.top ||
      clientY > sidebarRect.bottom
    ) {
      return null;
    }

    const nearest = candidates
      .filter((candidate) => !candidate.kind.includes("folder-sub"))
      .sort((a, b) => {
        const aCenter = a.rect.top + a.rect.height / 2;
        const bCenter = b.rect.top + b.rect.height / 2;
        return Math.abs(clientY - aCenter) - Math.abs(clientY - bCenter);
      })[0];

    if (!nearest) return null;

    const nearestCenter = nearest.rect.top + nearest.rect.height / 2;
    const before = clientY < nearestCenter;
    return {
      action: "reorder",
      path: before ? nearest.path : incrementPath(nearest.path),
      indicator: indicatorFromRect(nearest.rect, before ? "before" : "after"),
    };
  };

  const syncDragMove = (session: DragSession) => {
    setActiveDrag({ ...session });
    setDropHit(findDropHit(session.currentX, session.currentY, session.path));
  };

  const beginPointerDrag =
    (path: number[], preview: DragPreviewData, onTap: () => void) =>
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      dragSessionRef.current = {
        path,
        preview,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        currentX: event.clientX,
        currentY: event.clientY,
        hasMoved: false,
        onTap,
      };
    };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    session.currentX = event.clientX;
    session.currentY = event.clientY;

    const distance = Math.hypot(
      session.currentX - session.startX,
      session.currentY - session.startY,
    );
    if (distance > 4) {
      session.hasMoved = true;
      event.preventDefault();
      syncDragMove(session);
    }
  };

  const finishPointerDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!session.hasMoved) {
      session.onTap();
    } else {
      const finalHit = findDropHit(
        session.currentX,
        session.currentY,
        session.path,
      );
      if (finalHit) {
        if (finalHit.action === "merge") {
          onMerge(session.path, finalHit.path);
        } else {
          onReorder(session.path, finalHit.path);
        }
      }
    }

    dragSessionRef.current = null;
    setActiveDrag(null);
    setDropHit(null);
  };

  const cancelPointerDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const session = dragSessionRef.current;
    if (session && event.currentTarget.hasPointerCapture(session.pointerId)) {
      event.currentTarget.releasePointerCapture(session.pointerId);
    }

    dragSessionRef.current = null;
    setActiveDrag(null);
    setDropHit(null);
  };

  const wrapperStyle = (path: number[]): CSSProperties => ({
    marginTop:
      dropHit?.action === "reorder" && pathsEqual(dropHit.path, path) ? 14 : 0,
  });

  const itemInteractionProps = (
    path: number[],
    preview: DragPreviewData,
    onTap: () => void,
  ) => ({
    onPointerDown: beginPointerDrag(path, preview, onTap),
    onPointerMove: handlePointerMove,
    onPointerUp: finishPointerDrag,
    onPointerCancel: cancelPointerDrag,
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onTap();
      }
    },
  });

  const renderAvatar = (sub: Subreddit, size: "normal" | "small" | "tiny") => {
    const sizeClass =
      size === "normal"
        ? "h-12 w-12 text-sm"
        : size === "small"
          ? "h-9 w-9 text-[10px]"
          : "h-5 w-5 text-[7px]";
    const color = subColor(sub);

    if (sub.icon_url) {
      return (
        <img
          src={sub.icon_url}
          alt={`r/${sub.name}`}
          className={`${sizeClass} rounded-[30%] object-cover`}
          draggable={false}
        />
      );
    }

    return (
      <div
        className={`${sizeClass} flex items-center justify-center rounded-[30%] font-black tracking-tight text-white`}
        style={{ backgroundColor: color }}
      >
        {initials(sub.name)}
      </div>
    );
  };

  const renderBadge = (count: number) => {
    if (count <= 0) return null;

    return (
      <span className="absolute -bottom-1.5 -right-3 z-10 min-w-6 rounded-full border-[3px] border-black bg-[#d94b4b] px-1.5 py-0.5 text-center text-[11px] font-black leading-none text-white">
        {formatUnread(count)}
      </span>
    );
  };

  const renderActivityDot = (size: "normal" | "small") => (
    <span
      className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white pointer-events-none ${activityDotClass(size)}`}
    />
  );

  const renderFolderIcon = (
    subs: Subreddit[],
    isActive: boolean,
    isTargeted: boolean,
  ) => (
    <div
      className={`grid h-12 w-12 grid-cols-2 gap-0.5 overflow-hidden rounded-[18px] p-1 transition-all duration-200 ${
        isActive ? "bg-[#3b3d44]" : isTargeted ? "bg-[#444750]" : "bg-[#2b2d31]"
      }`}
    >
      {subs.slice(0, 4).map((sub) => (
        <div key={sub.id} className="overflow-hidden rounded-full">
          {renderAvatar(sub, "tiny")}
        </div>
      ))}
    </div>
  );

  const renderSubCircle = (
    sub: Subreddit,
    path: number[],
    isActive: boolean,
    size: "normal" | "small",
  ) => {
    const isDragging =
      activeDrag?.hasMoved && pathsEqual(activeDrag.path, path);
    const isTargeted =
      dropHit?.action === "merge" && pathsEqual(dropHit.targetPath, path);
    const badgeCount = unreadCount(sub);
    const buttonSizeClass = size === "normal" ? "h-12 w-12" : "h-9 w-9";
    const targetKind = size === "normal" ? "root-sub" : "folder-sub";

    return (
      <div
        key={sub.id}
        data-drop-path={path.join(",")}
        data-drop-kind={targetKind}
        className="relative flex w-full justify-center overflow-visible transition-[margin,transform] duration-200 ease-out"
        style={wrapperStyle(path)}
      >
        {sub.has_new && !isActive && renderActivityDot(size)}
        <button
          type="button"
          aria-label={`Open r/${sub.name}`}
          className={`${buttonSizeClass} relative flex shrink-0 cursor-grab items-center justify-center overflow-visible rounded-[30%] outline-none transition-all duration-200 ease-out active:cursor-grabbing ${
            isActive ? "bg-white/10 ring-2 ring-white/70" : "hover:bg-white/5"
          } ${isDragging ? "scale-105 opacity-50" : "opacity-100"} ${isTargeted ? "scale-105 ring-2 ring-[#d94b4b]" : ""}`}
          style={{ touchAction: "none" }}
          title={`r/${sub.name}`}
          {...itemInteractionProps(path, { kind: "sub", sub }, () =>
            onSelectSub(sub),
          )}
        >
          {renderAvatar(sub, size)}
          {renderBadge(badgeCount)}
        </button>
      </div>
    );
  };

  const renderItem = (item: SidebarItem, path: number[]): ReactNode => {
    if (item.kind === "sub") {
      return renderSubCircle(
        item.sub,
        path,
        activeSub?.id === item.sub.id,
        "normal",
      );
    }

    const folderHasNew = item.subs.some((sub) => sub.has_new);
    const folderUnread = folderUnreadCount(item.subs);
    const isAnyActive = item.subs.some((sub) => activeSub?.id === sub.id);
    const isDragging =
      activeDrag?.hasMoved && pathsEqual(activeDrag.path, path);
    const isTargeted =
      dropHit?.action === "merge" && pathsEqual(dropHit.targetPath, path);
    const endPath = [path[0], item.subs.length];

    return (
      <div key={item.id} className="flex w-full flex-col items-center gap-1">
        <div
          data-drop-path={path.join(",")}
          data-drop-kind="root-folder"
          className="relative flex w-full justify-center overflow-visible transition-[margin,transform] duration-200 ease-out"
          style={wrapperStyle(path)}
        >
          {folderHasNew && !isAnyActive && renderActivityDot("normal")}
          <button
            type="button"
            aria-label={
              item.expanded
                ? "Collapse subreddit group"
                : "Expand subreddit group"
            }
            className={`relative flex h-12 w-12 shrink-0 cursor-grab items-center justify-center overflow-visible rounded-[30%] outline-none transition-all duration-200 ease-out active:cursor-grabbing ${
              isAnyActive ? "bg-white/10" : "hover:bg-white/5"
            } ${isDragging ? "scale-105 opacity-50" : "opacity-100"} ${isTargeted ? "scale-105 ring-2 ring-[#d94b4b]" : ""}`}
            style={{ touchAction: "none" }}
            title="Subreddit group"
            {...itemInteractionProps(
              path,
              { kind: "folder", subs: item.subs },
              () => onToggleFolder(item.id),
            )}
          >
            {renderFolderIcon(item.subs, isAnyActive, isTargeted)}
            {renderBadge(folderUnread)}
          </button>
        </div>

        {item.expanded && (
          <div className="flex w-full flex-col items-center gap-1 rounded-2xl bg-white/[0.035] py-1.5">
            {item.subs.map((sub, i) =>
              renderSubCircle(
                sub,
                [...path, i],
                activeSub?.id === sub.id,
                "small",
              ),
            )}
            <div
              data-drop-path={endPath.join(",")}
              data-drop-kind="folder-end"
              className="h-2 w-11 transition-all duration-200"
              style={{
                height:
                  dropHit?.action === "reorder" &&
                  pathsEqual(dropHit.path, endPath)
                    ? 18
                    : 8,
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderHomeButton = () => {
    const homeUnread = sidebarUnreadCount(items);

    return (
      <div className="flex w-full flex-col items-center gap-2">
        <button
          type="button"
          onClick={onHome}
          className={`relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-visible rounded-[30%] text-white transition-colors duration-200 ${
            isHomeActive
              ? "bg-[#3b3d44] ring-2 ring-white/70"
              : "bg-[#2b2d31] hover:bg-[#34373d]"
          }`}
          title="For You"
          aria-label="Open For You home feed"
        >
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
            <path
              d="M8.2 20.4c-.5-1.2-.7-2.4-.7-3.8 0-5 3.4-8.6 7.5-8.6s7.5 3.6 7.5 8.6c0 1.4-.2 2.6-.7 3.8-1.1-.9-3.5-1.6-6.8-1.6s-5.7.7-6.8 1.6Z"
              fill="currentColor"
            />
            <path
              d="M8.6 20c-1.9-.3-3.1-1.4-3.1-3 0-1.3.8-2.4 2.1-2.8M21.4 20c1.9-.3 3.1-1.4 3.1-3 0-1.3-.8-2.4-2.1-2.8"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2.2"
            />
            <circle cx="12.1" cy="15.8" r="1.4" fill="#000000" />
            <circle cx="17.9" cy="15.8" r="1.4" fill="#000000" />
          </svg>
          {renderBadge(homeUnread)}
        </button>
        <div className="h-px w-8 rounded-full bg-white/10" />
      </div>
    );
  };

  const rootEndPath = [items.length];

  return (
    <aside
      ref={sidebarRef}
      className="relative flex w-[84px] shrink-0 flex-col items-center gap-2 overflow-visible bg-black px-2 py-3 text-white"
    >
      {renderHomeButton()}
      <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto overscroll-contain pr-2">
        {items.map((item, i) => renderItem(item, [i]))}
        <div
          data-drop-path={rootEndPath.join(",")}
          data-drop-kind="root-end"
          className="h-2 w-12 shrink-0 transition-all duration-200"
          style={{
            height:
              dropHit?.action === "reorder" &&
              pathsEqual(dropHit.path, rootEndPath)
                ? 18
                : 8,
          }}
        />
        <button
          onClick={onAddSub}
          className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-[30%] border-2 border-dashed border-white/20 text-white/55 transition-all duration-200 hover:border-white/70 hover:bg-white/10 hover:text-white"
          title="Add subreddit"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10 4v12M4 10h12" />
          </svg>
        </button>
      </div>

      <button
        onClick={onSettings}
        className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[30%] text-white/50 transition-all duration-200 hover:bg-white/10 hover:text-white"
        title="Settings"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {dropHit?.action === "reorder" && (
        <div
          className="pointer-events-none fixed z-40 h-1 rounded-full bg-white transition-all duration-100"
          style={{
            top: dropHit.indicator.top,
            left: dropHit.indicator.left,
            width: dropHit.indicator.width,
          }}
        />
      )}

      {activeDrag?.hasMoved && (
        <div
          className="pointer-events-none fixed z-50 flex h-14 w-14 items-center justify-center rounded-[28%] bg-[#2b2d31] ring-2 ring-white/50"
          style={{
            transform: `translate3d(${activeDrag.currentX - 28}px, ${activeDrag.currentY - 28}px, 0) scale(1.08)`,
          }}
        >
          {activeDrag.preview.kind === "sub" && activeDrag.preview.sub
            ? renderAvatar(activeDrag.preview.sub, "normal")
            : renderFolderIcon(activeDrag.preview.subs ?? [], false, true)}
        </div>
      )}
    </aside>
  );
}
