# F10 — Saved Folders

## Overview
User can create folders to organize saved posts, cherry-pick AI-recommended posts into folders, and batch export links from any folder to use with external platforms.

## Folder System

```
┌──────────────────────────────────────────────────────────────┐
│  📁 Saved Folders                                            │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  ┌─ Folders ───────────────────────────────────────────────┐│
│  │                                                          ││
│  │  📁 Growth Ideas (12 posts)          [Export] [Delete]  ││
│  │     "Content ideas for r/startups, r/indiehackers..."  ││
│  │                                                          ││
│  │  📁 Technical Deep Dives (8 posts)   [Export] [Delete]  ││
│  │     "Worth responding to in r/reactjs, r/python..."    ││
│  │                                                          ││
│  │  📁 Launch References (5 posts)     [Export] [Delete]   ││
│  │     "Similar product launches for reference"            ││
│  │                                                          ││
│  │  [+ New Folder]                                         ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Click folder to view its posts →                            │
└──────────────────────────────────────────────────────────────┘
```

## Folder Content View

```
┌──────────────────────────────────────────────────────────────┐
│  📁 Growth Ideas                         12 posts [Export]  │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  📅 Jun 12 — r/startups                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ✦ "Just launched MVP — now what?"                   │   │
│  │   Score 245 · 89 comments                            │   │
│  │   → reddit.com/r/startups/comments/abc123/           │   │
│  │   [Open] [Remove from folder]                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  📅 Jun 10 — r/indiehackers                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ✦ "What marketing channels work for dev tools?"     │   │
│  │   Score 178 · 67 comments                            │   │
│  │   → reddit.com/r/indiehackers/comments/def456/       │   │
│  │   [Open] [Remove from folder]                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ─────────────────────────────────────────────────────────── │
│  [Export All Links] [Remove All]                             │
└──────────────────────────────────────────────────────────────┘
```

## Save Actions

Posts can be saved to folders from multiple places:

```
Sources:
  • Post card → [Save to Folder] button
  • Engagement Queue → [Save to Folder] button
  • Post Detail → [Save to Folder] button
  • Search results → [Save to Folder] button
  • Batch save from search results

Flow:
  Click [Save to Folder]
    │
    ▼
  Folder picker modal:
    ┌──────────────────────────┐
    │  Save to folder:         │
    │  ○ Growth Ideas (12)     │
    │  ○ Technical Deep (8)    │
    │  ● Launch Refs (5)       │
    │  ───────────────────────│
    │  [+ Create New Folder]   │
    │                          │
    │  [Cancel]  [Save]        │
    └──────────────────────────┘
```

## Create Folder

```
┌──────────────────────────────────────────┐
│  + New Folder                            │
│  ─────────────────────────────────────── │
│  Name:     ┌────────────────────────┐   │
│           │  Growth Ideas           │   │
│           └────────────────────────┘   │
│                                          │
│  Optional description:                  │
│           ┌────────────────────────┐   │
│           │  Posts worth exploring │   │
│           │  for content ideas     │   │
│           └────────────────────────┘   │
│                                          │
│  [Cancel]              [Create Folder]  │
└──────────────────────────────────────────┘
```

## Batch Export Links

From any folder or search results:

```
┌──────────────────────────────────────────┐
│  Export Links from "Growth Ideas"        │
│  ─────────────────────────────────────── │
│                                          │
│  Select: [All] [None]                    │
│                                          │
│  ☑ reddit.com/r/startups/abc123/       │
│  ☑ reddit.com/r/indiehackers/def456/   │
│  ☐ reddit.com/r/marketing/ghi789/      │
│  ☑ reddit.com/r/design/jkl012/         │
│                                          │
│  3 of 12 selected                        │
│                                          │
│  [Copy to Clipboard]                    │
│  [Download as .txt]                     │
│  [Download as .csv]                     │
└──────────────────────────────────────────┘
```

## SQLite Schema

```sql
CREATE TABLE saved_folders (
  id TEXT PRIMARY KEY,           -- UUID
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE TABLE saved_folder_items (
  id TEXT PRIMARY KEY,           -- UUID
  folder_id TEXT NOT NULL REFERENCES saved_folders(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  added_at TEXT DEFAULT (datetime('now')),
  UNIQUE(folder_id, post_id)     -- no duplicate posts in same folder
);
```

## Nuances & Edge Cases
- **Folder limits**: No hard limit, but suggest organizing if >50 folders
- **Duplicate saves**: UNIQUE constraint prevents same post in same folder twice
- **Cross-folder saves**: Same post CAN be in multiple folders
- **Deleted posts**: If Reddit post is deleted, show "[deleted]" in folder view but keep metadata
- **Export formats**: Clipboard (plain text), .txt (one URL per line), .csv (URL + title + subreddit)
- **Rename/delete folders**: Rename inline, delete with confirmation
- **Empty folders**: Show "No saved posts yet" with guidance on how to save
- **Sidebar integration**: Folder icons in bottom sidebar section, click to open
