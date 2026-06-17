# F3 TODOs

## Project Scaffold
- [x] Initialize Tauri + React project
- [x] Install shadcn/ui and configure
- [x] Set up black & white theme (tailwind config)
- [x] Add Inter font (Bold 18px titles, Regular body)
- [x] Configure Lucide icons

## Sidebar
- [x] Left sidebar component (70px width)
- [x] SubCircle component (subreddit icon, active state)
- [x] AddSubButton (opens dialog to add sub)
- [x] Scrollable list
- [x] Settings gear icon at bottom
- [x] Saved folder icons section (bottom, below subs)
- [x] AddFolderButton
- [x] ForYouButton (home, app icon, unread badge, divider)

## TopBar
- [x] TabBar: General, Filter, AI, Cross-Post, Inbox
- [x] SearchInput (context-aware)
- [x] Inbox notification badge

## Views
- [x] For You view (needs dual-mode toggle)
- [x] Digested mode — day+channel grouped posts
- [x] Normal mode — Reddit-style infinite scroll
- [x] Engagement Queue (AI tab)
- [ ] Cross-Post Editor view (F4)
- [x] PostDetail view
- [x] Inbox view

## Components
- [x] PostCard (title, score, sub, time, comments, ✦ badge)
- [x] FAB component
- [x] NewPostModal (add "Open in Cross-Post" button)
- [x] ForYouToggle (Digested/Normal switch)
- [x] EngagementCard (post + AI reason + [Reply]/[Dismiss]/[Save])
- [x] WorthRespondingBadge (✦ icon, no score number)
- [ ] ArchivePrompt modal (save/discard on close)
- [ ] RecoveryToast (on launch after crash)

## Tauri Commands (Rust → React)
- [x] `get_posts(subreddit, limit, offset)`
- [x] `get_post_detail(post_id)`
- [x] `get_subreddits()`
- [x] `add_subreddit(name)`
- [x] `get_worth_responding_posts()`
- [x] `get_digested_posts(date_range)`
- [x] `get_normal_feed(subs, cursor)`
- [x] `dismiss_post(post_id)`
- [x] `mark_seen(post_id)`

## Drag & Drop + Folder Grouping
- [x] Replace HTML5 DnD with custom pointer-event drag
- [x] Drop-to-merge: create folder (2×2 mini-dot grid icon)
- [x] Folder expand/collapse
- [x] Drag-out-of-folder to ungroup
- [x] Spring-animate reorder
- [x] Custom drag preview and drop indicator
