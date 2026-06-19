# F06-A — Sidebar System

Left navigation with subreddit circles, folder groups, drag-to-reorder, and merge-to-folder. Unread count badges. Activity dots for new content.

## What's Built

- Subreddit circles with icons or colored initials
- Folder groups (expandable, shows 4 tiny icons)
- Full pointer-event drag-and-drop (reorder + merge into folders)
- Drop indicators (reorder line, merge highlight)
- Unread count badges (red pill with count)
- Activity dots (white dot for new content)
- Home button (alien avatar with aggregated badge)
- Add subreddit button (+)
- Settings gear

## What Needs Fixing

- Icon URLs need proper loading (some may be blocked)
- Color system not integrated (accent_color from DB not used for sub circles)
- Unread counts are placeholders (need actual computation from unseen posts)

## Files

- `src/components/Sidebar.tsx` — full sidebar with drag-and-drop
- `src/App.tsx` — `handleReorder`, `handleMerge`, `handleToggleFolder` callbacks
- `src/types.ts` — `SidebarItem` discriminated union

## Verification

- [ ] Drag subreddit to reorder
- [ ] Drag sub onto folder → merged
- [ ] Expand/collapse folders
- [ ] Icons display correctly
- [ ] Unread badges show counts
