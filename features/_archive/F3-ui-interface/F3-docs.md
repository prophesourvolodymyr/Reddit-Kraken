# F3 — UI Interface

## Overview
React + shadcn/ui frontend inside Tauri. Black & white minimalistic design. Discord-like layout with left sidebar, 5 main views, cross-posting editor, and saved folders panel.

## Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                          REDDIT KRAKEN                              │
│  ┌────┐  ┌─────────────────────────────────────────────────────────┐│
│  │    │  │  [General]  [Filter]  [AI]  [Cross-Post]  [Inbox]     ││
│  │ 🟠 │  ├─────────────────────────────────────────────────────────┤│
│  │ 🟣 │  │  Content Area (80% width)                               ││
│  │ 🟢 │  │                                                         ││
│  │ 🔴 │  │  ┌─────────────────────────────────────────────────┐   ││
│  │    │  │  │  Posts / Cross-Post Editor / Saved Folders      │   ││
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
- Top: For You button (home icon, app logo, unread badge, divider)
- Subreddit icons as circles (their Reddit avatar/icon)
- Folder icons (2×2 mini-dot grid, Discord-like)
- Active sub highlighted with white border ring
- "+" button to add subreddit
- **New**: Saved folders section at bottom (folder icons in muted style)
- Bottom: settings gear icon
- Scrollable
- Drag-and-drop reordering + folder grouping via pointer events (not HTML5 DnD)

## TopBar Tabs

| Tab | View | Purpose |
|-----|------|---------|
| General | For You | Main feed — toggles between Digested and Normal |
| Filter | Filter/Search | Search with full filters |
| AI | Engagement Queue | "Worth responding" posts only |
| Cross-Post | Cross-Post Editor | Multi-sub posting workspace |
| Inbox | PMs | Private messages |

## Views

### 1. For You — Dual Mode

Toggle button: `[Digested] [Normal]`

**Digested mode** (default) — AI-curated posts organized by day + channel:

```
┌────────────────────────────────────────────────────────────┐
│  📰 For You              [Digested] [Normal]              │
│  ──────────────────────────────────────────────────────── │
│                                                           │
│  📅 Today — r/reactjs                                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ✦ "How do I handle rewrites in Next.js config?"    │  │
│  │   ✦ Worth responding • 12 comments • 2h            │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ✦ "useEffect running twice in production"          │  │
│  │   ✦ Worth responding • 8 comments • 5h             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  📅 Yesterday — r/startups                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ✦ "Just launched MVP — now what?"                  │  │
│  │   ✦ Worth responding • 31 comments • 1d            │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**Normal mode** — classic Reddit-style scroll from user's chosen channels:

```
┌────────────────────────────────────────────────────────────┐
│  📰 For You              [Digested] [Normal]              │
│  ──────────────────────────────────────────────────────── │
│                                                           │
│  r/reactjs                                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ "What's new in React 19?" · 245 ⬆ · 89 💬 · 3h    │  │
│  │  r/reactjs · u/dev_user                              │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ "State management in 2025?" · 432 ⬆ · 156 💬 · 5h │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  r/python                                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ "FastAPI vs Flask for new project?" · 178 ⬆ · 67 💬│  │
│  └─────────────────────────────────────────────────────┘  │
│                              ... infinite scroll ...       │
└────────────────────────────────────────────────────────────┘
```

### 2. Per-Sub View (click sidebar circle)

```
┌────────────────────────────────────────────────────────────┐
│  🟠 r/reactjs                  🔍 Search in sub...       │
│  ──────────────────────────────────────────────────────── │
│  [Hot]  [New]  [Top]                                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Post title · 245 ⬆ · 89 💬 · 3h · u/dev_user     │  │
│  │ ✦ Worth responding                                  │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 3. Engagement Queue (AI tab)

Dedicated view for all "Worth responding" posts — flat scrollable list, no complex sections:

```
┌────────────────────────────────────────────────────────────┐
│  ✦ Worth Responding                    12 posts          │
│  ──────────────────────────────────────────────────────── │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ r/reactjs · 2h ago                                  │  │
│  │ "How do I handle rewrites in Next.js config?"      │  │
│  │ 💡 They're asking about Vercel rewrites — your     │  │
│  │    exact expertise.                                 │  │
│  │ [Reply] [Dismiss] [Save to Folder]                 │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ r/python · 5h ago                                   │  │
│  │ "Need help with async file processing"             │  │
│  │ 💡 Python async I/O question matches your profile. │  │
│  │ [Reply] [Dismiss] [Save to Folder]                 │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 4. Cross-Post Editor (see F4 docs for full detail)

### 5. Inbox (PMs)

## Saved Folders Panel (sidebar section)

Bottom of sidebar, after subreddits:

```
┌────┐
│ ...│  ← subreddit circles above
│ 🟡 │
│ ⚪ │
│────│  ← divider
│ 📁 │  ← folder 1
│ 📁 │  ← folder 2
│ 📁 │  ← folder 3
│ [+} │  ← new folder
│────│
│ ⚙️ │  ← settings
└────┘
```

Clicking a folder opens it in the main content area (see F10 docs).

## Component Tree (extended)

```
App
├── Sidebar
│   ├── ForYouButton (home)
│   ├── SubCircle (icon, active state, unread badge)
│   ├── FolderIcon (2×2 grid, Discord-like)
│   ├── AddSubButton
│   ├── SavedFolderItem (folder icons, click to open)
│   ├── AddFolderButton
│   └── SettingsButton
├── TopBar
│   ├── TabBar (General | Filter | AI | Cross-Post | Inbox)
│   └── SearchInput
├── ContentArea
│   ├── ForYouView (dual mode)
│   │   ├── DigestedFeed (day+channel grouped)
│   │   ├── NormalFeed (Reddit-style scroll)
│   │   └── WorthRespondingBadge (✦ icon)
│   ├── PostList (per-sub view)
│   │   └── PostCard (✦ badge, score, sub, time, comments)
│   ├── FilterView
│   │   ├── FilterBar
│   │   └── SearchResults
│   ├── EngagementQueue (AI tab)
│   │   ├── EngagementCard (post + AI reason + actions)
│   │   └── ActionBar ([Reply] [Dismiss] [Save to Folder])
│   ├── CrossPostView (F4)
│   │   ├── PostGrid (multi-sub window layout)
│   │   ├── PerSubPanel (individual adjustments)
│   │   └── SchedulePanel
│   ├── PostDetail
│   │   ├── PostContent
│   │   ├── CommentThread
│   │   └── ReplyComposer (inline, manual AI assist button)
│   ├── InboxView
│   │   ├── MessageList
│   │   └── MessageDetail
│   ├── SavedFolderView (F10)
│   │   ├── FolderList
│   │   ├── PostGrid (saved posts)
│   │   └── ExportButton
│   └── NewPostModal (FAB overlay, single-sub quick post)
│       ├── SubredditSelector
│       ├── PostTypeSelector (Text | Link | Image)
│       ├── TitleInput (AI suggest)
│       ├── BodyEditor (AI enhance/rewrite)
│       ├── FlairSelector
│       ├── NSFW/Spoiler toggles
│       └── PostButton / Open in Cross-Post button
└── FAB (floating action button, bottom-right)
```

## Styling
- **Theme**: Black & white minimalistic
- **Titles**: Inter Bold 18px
- **Body**: Inter Regular 14px
- **Colors**: #000 (black), #fff (white), #333 (muted text), #f5f5f5 (bg), #e5e5e5 (borders)
- **shadcn components**: Button, Card, Input, Dialog, Tabs, Select, ScrollArea, Toggle
- **Icons**: Lucide
- **Dark mode**: Invert colors — bg black, text white
- **Cursor pointer**: All interactive elements
- **Transitions**: 150-200ms ease
- **Worth responding badge**: ✦ icon + subtle highlight border, no score numbers

## For You Toggle Logic

```
┌──────────────────────────────────┐
│  Digested mode                   │
│  - Show: worth_responding=1      │
│  - Group by: date → subreddit    │
│  - Sort: newest first            │
│  - Default for first open        │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Normal mode                     │
│  - Show: all posts (hot + new)   │
│  - From: user's subscribed subs  │
│  - Sort: Reddit-style feed       │
│  - Infinite scroll               │
│  - ✦ badge still shows if post   │
│    is worth responding           │
└──────────────────────────────────┘
```

## Nuances
- **Empty state**: "No posts yet. Add a subreddit to get started." with illustration
- **Loading state**: Skeleton cards while posts load
- **Error state**: Inline error with retry button
- **Scroll restoration**: Remember scroll position when navigating back
- **Keyboard navigation**: Tab between posts, Enter to open, Escape to close
- **Responsive**: Minimum 900px width for desktop
- **Infinite scroll**: Load more posts as user scrolls (Normal mode)
- **FAB tooltip**: Shows current auto-detected subreddit on hover
- **"Open in Cross-Post"**: Button in FAB modal to open post in full cross-posting editor
- **Saved folders**: Bottom sidebar section, folder icons, click to open
- **Archive prompts**: Modal on close with unsaved work
- **Recovery toast**: On launch after crash — "Recovered 2 drafts from last session"
