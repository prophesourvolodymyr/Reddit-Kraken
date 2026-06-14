# F9 — Activity Center

## Overview
A unified hub where the user reviews all Reddit activity — replies to their posts/comments, mentions, and PMs. Minimal AI: no auto-triage, no auto-draft, no auto-respond. User is in full control.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Polling Scheduler (every 5 min)                              │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Replies to   │  │ Comments on  │  │ PMs + Mod msgs   │  │
│  │ your comments│  │ your posts   │  │                   │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────────┘  │
│         │                  │                   │              │
│         └──────────────────┴───────────────────┘              │
│                            │                                   │
│                            ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Activity Center Storage (SQLite)                        │ │
│  │  • activities table                                      │ │
│  │  • Each row: source, type, user, text, status            │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## UI — Activity Center Panel

Accessed via **bell icon** in top bar.

```
┌──────────────────────────────────────────────┐
│  🔔 5                                       │
└──────────────────────────────────────────────┘
                │ click
                ▼
┌──────────────────────────────────────────────────────────────┐
│  🎯 Activity Center                       [Mark all read]   │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  💬 u/dev_guru replied to your comment in r/reactjs         │
│     "Yeah but that doesn't work with StrictMode..."         │
│     [Reply] [Dismiss]                                       │
│                                                              │
│  💬 u/someone commented on your post in r/python            │
│     "Great answer! I'd add that async context..."           │
│     [Reply] [Dismiss]                                       │
│                                                              │
│  📬 u/johndoe • "Hey love your tool!" (PM)                 │
│     [Reply] [Dismiss]                                       │
│                                                              │
│  ── Older ──                                                │
│  ✅ u/bob • "Great answer!" — you replied 2h ago           │
│  ✅ u/alice • "Can you elaborate?" — you replied 5h ago    │
└──────────────────────────────────────────────────────────────┘
```

## Activity Types

| Type | Icon | Source | Identified by |
|------|------|--------|---------------|
| Reply to your comment | 💬 | GET /message/inbox?type=comments | `was_comment: true` |
| Comment on your post | 💬 | GET /message/inbox?type=posts | `was_comment: true` |
| Private message | 📬 | GET /message/inbox | `was_comment: false` |
| Mod message | 🛡️ | GET /message/inbox | author is sub name |
| Username mention | @ | Search in comments | Contains `u/yourusername` |

## Quick Reply Flow

```
User sees activity
         │
         ▼
[Reply] → opens inline quick composer (manual, no auto-draft)
            → [🤖 Suggest Reply] if user wants AI help
            → User edits
            → [Send]

[Dismiss] → hides activity from list, marks as "dismissed"
```

## What Changed From V1
- **Removed**: AI auto-triage (high_value/low_value/spam classification)
- **Removed**: Auto-generated draft replies
- **Removed**: Per-sub prompt AI drafts
- **User controls everything**: Activities shown as-is, user decides to reply or dismiss
- **AI optional**: [🤖 Suggest Reply] button available on demand

## SQLite Schema

```sql
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,             -- reply | comment | pm | mod_msg | mention
  source TEXT NOT NULL,           -- subreddit name or "dm"
  from_user TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  context_url TEXT,
  parent_fullname TEXT,
  was_read INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new',      -- new | dismissed | acted
  created_utc REAL,
  acted_at TEXT,
  fetched_at TEXT DEFAULT (datetime('now'))
);
```

## Edge Cases & Nuances
- **Self-replies**: Don't notify for your own replies
- **Duplicate activities**: Dedup by activity ID
- **Stale activities**: Auto-archive after 14 days
- **Polling**: Every 5 min
- **Desktop notification**: Tauri notification for new activity
- **History**: Shows last 50 acted-upon activities
- **Keyboard shortcuts**: `J`/`K` navigate, `Enter` expand, `R` reply, `D` dismiss
