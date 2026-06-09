# F3 — UI Interface

## Overview
React + shadcn/ui frontend inside Tauri. Black & white minimalistic design. Discord-like layout with left bar, 4 main views, and full navigation.

## Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                          REDDIT KRAKEN                              │
│  ┌────┐  ┌─────────────────────────────────────────────────────────┐│
│  │    │  │  [General]  [Filter/Search]  [AI Respond]  [Inbox]     ││
│  │ 🟠 │  ├─────────────────────────────────────────────────────────┤│
│  │ 🟣 │  │  Content Area (80% width)                               ││
│  │ 🟢 │  │                                                         ││
│  │ 🔴 │  │  ┌─────────────────────────────────────────────────┐   ││
│  │    │  │  │  Posts / Comments / AI Panel / Composer          │   ││
│  │ 🟡 │  │  │                                                  │   ││
│  │ ⚪ │  │  └─────────────────────────────────────────────────┘   ││
│  │    │  │                                                         ││
│  │ ⚫ │  │                                                         ││
│  │ [+} │  │                           ┌──────┐                    ││
│  │──── │  │                           │  ✍️  │  ← FAB             ││
│  │ Add │  │                           └──────┘                    ││
│  │ Sub │  │                                                         ││
│  └────┘  └─────────────────────────────────────────────────────────┘│
│  70px                                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Left Sidebar (70px)
- Subreddit icons as circles (their Reddit avatar/icon)
- Active sub highlighted with white border
- "+" button to add subreddit
- Bottom: settings gear icon
- Scrollable if > 10 subs

## Views

### 1. General Tab
```
┌────────────────────────────────────────────────────────────┐
│  General / For You                                        │
│  ──────────────────────────────────────────────────────── │
│  🔥 Critical (score 9-10)                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Post title · Score: 9 · r/reactjs · 2h             │  │
│  │ 💡 AI: Direct match to your expertise               │  │
│  │ 💬 12 comments · Status: New                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  📌 Suggested (score 7-8)                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Post title · Score: 7 · r/python · 5h              │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  📋 All Posts (score < 7)                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Post title · Score: 5 · r/startups · 1h            │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 2. Per-Sub View (click circle)
```
┌────────────────────────────────────────────────────────────┐
│  🟠 r/reactjs                  🔍 Search in sub...       │
│  ──────────────────────────────────────────────────────── │
│  [Hot]  [New]  [Top]  [AI Ranked]                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Post title · Score: 6 · 3h · 8 comments            │  │
│  │ Status: Reviewed                                     │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 3. Filter/Search Tab
```
┌────────────────────────────────────────────────────────────┐
│  🔍 Search...                    [Subreddit ▾]           │
│  [Date ▾]  [Score ▾]  [Status ▾]  [Clear]               │
│  ──────────────────────────────────────────────────────── │
│  Results (3)                                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Matching posts...                                    │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 4. AI Respond Tab
Split view: left = priority queue, right = analysis + composer.

### 5. Inbox Tab (PMs)
```
┌────────────────────────────────────────────────────────────┐
│  📬 Messages                     [✍️ Compose]            │
│  ──────────────────────────────────────────────────────── │
│  [Inbox]  [Unread]  [Sent]                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ● u/user · 2h ago · "Hey, saw your post about..."  │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Component Tree

```
App
├── Sidebar
│   ├── SubCircle (icon, active state, click)
│   ├── AddSubButton
│   └── SettingsButton
├── TopBar
│   ├── TabBar (General | Filter/Search | AI Respond | Inbox)
│   └── SearchInput (per-sub or global)
├── ContentArea
│   ├── PostList (General view)
│   │   ├── PostCard (score, title, sub, time, comments)
│   │   ├── CriticalSection (score 9-10)
│   │   ├── SuggestedSection (score 7-8)
│   │   └── AllPostsSection (score < 7)
│   ├── FilterView (Filter/Search tab)
│   │   ├── FilterBar (sub, date, score, status dropdowns)
│   │   └── SearchResults
│   ├── AIRespondView (split pane)
│   │   ├── PriorityQueue
│   │   │   ├── CriticalItem
│   │   │   └── SuggestedItem
│   │   └── AIPanel
│   │       ├── PostPreview
│   │       ├── AnalysisBlock (score, reason, comment insights)
│   │       └── DraftComposer (editor + AI buttons)
│   ├── PostDetail
│   │   ├── PostContent
│   │   ├── CommentThread
│   │   │   ├── CommentCard
│   │   │   └── AICommentInsight
│   │   └── ReplyComposer (inline)
│   ├── InboxView
│   │   ├── MessageList
│   │   └── MessageDetail
│   └── NewPostModal (FAB overlay)
│       ├── SubredditSelector (auto-detected, changeable)
│       ├── PostTypeSelector (Text | Link | Image)
│       ├── TitleInput (with AI suggest)
│       ├── BodyEditor (with AI enhance/rewrite/expand)
│       ├── FlairSelector
│       └── PostButton
└── FAB (floating action button, bottom-right)
```

## Styling
- **Theme**: Black & white minimalistic
- **Titles**: Inter Bold 18px
- **Body**: Inter Regular
- **Colors**: #000 (black), #fff (white), #333 (muted text), #f5f5f5 (bg), #e5e5e5 (borders)
- **shadcn components**: Button, Card, Input, Dialog, Tabs, Select, ScrollArea
- **Icons**: Lucide (consistent SVG set)
- **Dark mode**: Invert colors — bg black, text white
- **Cursor pointer**: All interactive elements
- **Transitions**: 150-200ms ease

## Nuances
- **Empty state**: "No posts yet. Add a subreddit to get started." with illustration
- **Loading state**: Skeleton cards while posts load
- **Error state**: Inline error with retry button
- **Scroll restoration**: Remember scroll position when navigating back
- **Keyboard navigation**: Tab between posts, Enter to open, Escape to close
- **Responsive**: Minimum 900px width for desktop; mobile adaptations later
- **Infinite scroll**: Load more posts as user scrolls down
- **FAB tooltip**: Shows current auto-detected subreddit on hover

## Sidebar Drag + Discord-like Groups
- HTML5 Drag-and-Drop is intentionally not used because macOS Tauri WKWebView does not reliably emit `draggable`, `dragstart`, or `drop` events.
- `Sidebar.tsx` now uses pointer capture with `onPointerDown`, `onPointerMove`, `onPointerUp`, and `onPointerCancel` so mouse/trackpad dragging stays inside React/Tauri.
- Root subreddit icons and folder icons are both draggable. Expanded folder children are smaller draggable subreddit icons.
- Dropping near an item's center calls `onMerge`; dropping above/below calls `onReorder` with an insertion path.
- Dragging a child out of an expanded folder to a root insertion slot converts it back into a root subreddit item.
- The sidebar renders a custom fixed-position drag preview and fixed-position white drop indicator line instead of relying on a browser drag ghost.
- Discord-like grouping is represented by a 2x2 folder avatar grid, unread badges, target rings, scale-up feedback, and animated spacing while dragging.
- The final direction is Discord-inspired but flatter: solid avatar colors, no gradients, minimal rings, and no heavy shadows.
- The top sidebar control is a separate `For You` home button with an app icon, unread badge, and divider. Clicking it clears the active subreddit and returns to the General feed.
