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

## TopBar
- [x] TabBar: General, Filter/Search, AI Respond, Inbox
- [x] SearchInput (context-aware — global or per-sub)
- [x] Inbox notification badge

## Views
- [x] General view with PostList
- [x] Per-sub view (when clicking sidebar circle)
- [x] Filter/Search view with FilterBar
- [x] AI Respond split view
- [x] Inbox view for PMs
- [x] PostDetail view (when clicking a post)

## Components
- [x] PostCard (title, score, sub, time, comments, AI badge)
- [x] CriticalSection/SuggestedSection/AllPostsSection
- [x] FAB component (bottom-right, tooltip, opens NewPost modal)
- [x] NewPostModal (sub selector, type selector, title, body, AI buttons)
- [x] DraftComposer (editor + AI suggestions)
- [x] AIPanel (analysis card with reasoning)
- [x] CommentThread + CommentCard + AICommentInsight
- [x] MessageList + MessageDetail for PMs

## Tauri Commands (Rust → React)
- [x] `get_posts(subreddit, status, limit)`
- [x] `get_post_detail(post_id)`
- [x] `get_subreddits()`
- [x] `add_subreddit(name)`
- [x] `analyze_post(post_id)`
- [x] `submit_reply(post_id, body)`
- [x] `create_post(subreddit, title, body, type)`
- [x] `get_messages()`
- [x] `send_message(to, subject, body)`

## Drag & Drop + Folder Grouping ✅ DONE
- [x] Replace HTML5 DnD with custom pointer-event drag (mouse/trackpad)
- [x] Drag ghost: hide default, show custom drop indicator line between circles
- [x] Drop-to-merge: drop circle onto another → create folder (2x2 mini-dot grid icon)
- [x] Folder expand/collapse: click folder to reveal subs as smaller circles below
- [x] Drag-out-of-folder: drag sub out of expanded folder to ungroup
- [x] Spring-animate reorder: items slide apart to make room during drag
- [x] Haptic-like feedback: dragged item scales up slightly, target area highlights
