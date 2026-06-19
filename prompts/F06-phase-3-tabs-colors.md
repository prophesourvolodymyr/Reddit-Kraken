# Phase 3 of F06 — Fix Tab Navigation + Color System

## Context
Tab labels are correct but behavior is reversed. "For You" should be the algorithmic feed (default landing for non-sub views). "General" should show chronological recent posts. Also need to extract real accent colors from subreddit icons instead of hardcoded color map.

## What You Need to Read First
- `features/F06-ui-shell/F06-C-color-system/DOCKS.md` — color extraction plan
- `features/F06-ui-shell/F06-D-tabs/DOCKS.md` — tab behavior spec
- `src/components/TopBar.tsx` — For You / General toggle
- `src/components/PostList.tsx` — mode prop ("digested" vs "normal")
- `src/components/Sidebar.tsx:25-39` — SUB_COLORS hardcoded map
- `src/components/Sidebar.tsx:83-85` — subColor() function
- `src/App.tsx` — activeView state, handleSelectSub

## Codebase Learnings
- Sidebar has hardcoded `SUB_COLORS` map (reactjs: "#64d98a", python: "#3776ab", etc.)
- `subColor(sub)` returns `sub.accent_color || SUB_COLORS[sub.name] || "#64748b"`
- DB already stores `accent_color` from Reddit API's `primary_color` field
- PostList `mode`: "digested" = For You, "normal" = General
- App.tsx: `handleSelectSub` sets `activeView` to "general"
- PostList renders "digested" when `mode === "digested" && !activeSub`

## What to Build
- Task 1: Fix "For You" — when no sub selected, show algorithmic feed (just recent all-sub posts for now)
- Task 2: Fix "General" — when sub selected, show recent posts from that sub
- Task 3: Remove hardcoded SUB_COLORS — use `accent_color` from DB
- Task 4: If `accent_color` is null, extract from subreddit icon (download + dominant color)
- Task 5: Apply accent color to sidebar glow effect + subreddit initials background

## Files to Modify
- modify: `src/components/PostList.tsx` — mode handling for For You vs General
- modify: `src/App.tsx` — activeView defaults
- modify: `src/components/Sidebar.tsx` — remove SUB_COLORS, use DB accent_color
- modify: `src/components/TopBar.tsx` — labels (if needed)
- create: `src-tauri/src/color.rs` — extract_dominant_color()

## Verification
- [ ] Open app → "For You" tab active → shows mixed posts from all subs
- [ ] Click subreddit → switches to "General" → shows that sub's posts
- [ ] Click "For You" tab → shows algorithmic feed again
- [ ] Each subreddit has unique accent color from DB (not hardcoded)
- [ ] Glow bleed effect uses real accent color
- [ ] Sidebar initials background uses real accent color

## When You Finish
Report tab behavior verification and color extraction results.
