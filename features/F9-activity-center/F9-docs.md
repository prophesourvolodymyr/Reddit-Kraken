# F9 — Activity Center

## Overview
A unified hub where the user reviews, triages, and acts on all Reddit activity — replies to their posts/comments, mentions, PMs, and mod messages. AI pre-filters by value, generates reply drafts per-sub prompt, and lets the user accept/decline/edit/send without navigating away.

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
│  │  AI Triage (per sub prompt + profile)                    │ │
│  │                                                          │ │
│  │  For each activity:                                      │ │
│  │  1. Identify type: reply / comment / pm / mod_msg        │ │
│  │  2. Evaluate value (sub prompt + your profile)           │ │
│  │  3. Assign: high_value / low_value / spam                │ │
│  │  4. If high_value → generate draft reply                 │ │
│  │  5. If low_value → auto-dismiss (collapsed)              │ │
│  │  6. If spam → fully hidden                               │ │
│  └──────────────────────┬───────────────────────────────────┘ │
│                         │                                      │
│                         ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Activity Center Storage (SQLite)                        │ │
│  │  • activities table                                      │ │
│  │  • Each row: source, type, user, text, ai_value,         │ │
│  │    ai_draft, status (new/dismissed/acted/snoozed)         │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## UI — Activity Center Panel

Accessed via **bell icon** next to settings gear in top bar.

```
┌──────────────────────────────────────────────────────────────┐
│  ⚙️ [🔔 5]                                                   │
└──────────────────────────────────────────────────────────────┘
                    │ click
                    ▼
┌──────────────────────────────────────────────────────────────┐
│  🎯 Activity Center                       [Mark all read]   │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  ┌─ High Value ────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │ 💬 u/dev_guru replied to your comment in r/reactjs     │ │
│  │    "Yeah but that doesn't work with StrictMode..."     │ │
│  │    🧠 AI: Worth replying — they're partially right      │ │
│  │    💬 "It does work, just add a cleanup function..."    │ │
│  │    [Decline] [Edit & Send ➔]                           │ │
│  │                                                        │ │
│  │ 📬 u/johndoe • "Hey love your tool!" (PM)             │ │
│  │    🧠 AI: Potential user — high value                   │ │
│  │    💬 "Thanks! Happy to help. What's your question?"    │ │
│  │    [Decline] [Edit & Send ➔]                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Low Value (2) ────▶ [Expand] ─────────────────────────┐ │
│  │  💬 u/user1 • "thanks!"                              │ │
│  │  💬 u/user2 • "+1"                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ History ───────────────────────────────────────────────┐ │
│  │  ✅ u/bob • "Great answer!" — you replied 2h ago       │ │
│  │  ✅ u/alice • "Can you elaborate?" — you replied 5h ago│ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Activity Types

| Type | Icon | Source | Identified by |
|------|------|--------|---------------|
| Reply to your comment | 💬 | GET /message/inbox?type=comments | `was_comment: true`, `first_message_name` matches your comment |
| Comment on your post | 💬 | GET /message/inbox?type=posts | `was_comment: true`, `first_message_name` matches your post |
| Private message | 📬 | GET /message/inbox | `was_comment: false`, `author` not a subreddit |
| Mod message | 🛡️ | GET /message/inbox | `was_comment: false`, `author` is a subreddit name |
| Username mention | @ | Search in comments | Contains `u/yourusername` |

## AI Triage Logic

```
Given per-sub prompt + user profile + activity text:

If activity matches high-value criteria (per prompt):
  → draft reply using prompt's tone/style
  → status: "high_value"
  → show in expanded card with draft

If activity is low-value (thanks, +1, agreed, etc.):
  → no draft needed
  → status: "low_value"
  → show collapsed under "Low Value"

If activity is spam/abuse:
  → status: "spam"
  → fully hidden
```

## Quick Reply Flow

```
User sees activity card
         │
         ▼
┌─────────────────┐     ┌───────────────────┐
│ [Decline]       │     │ [Edit & Send ➔]   │
│ Dismiss activity│     │ Opens mini-composer│
│ status: dismissed│     │ with AI draft loaded│
└─────────────────┘     └────────┬──────────┘
                                 │ user edits
                                 ▼
                           [Send] → POST /api/comment or /api/compose
```

## SQLite Schema

```sql
CREATE TABLE activities (
  id TEXT PRIMARY KEY,            -- unique activity ID
  type TEXT NOT NULL,             -- reply | comment | pm | mod_msg | mention
  source TEXT NOT NULL,           -- subreddit name or "dm"
  from_user TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  context_url TEXT,               -- link to the post/comment
  parent_fullname TEXT,           -- t1_* or t3_* for threading
  was_read INTEGER DEFAULT 0,
  ai_value TEXT,                  -- high_value | low_value | spam
  ai_reasoning TEXT,
  ai_draft TEXT,
  status TEXT DEFAULT 'new',      -- new | dismissed | acted | snoozed
  created_utc REAL,
  acted_at TEXT,
  fetched_at TEXT DEFAULT (datetime('now'))
);
```

## Edge Cases & Nuances
- **Self-replies**: Don't notify when you reply to yourself
- **Duplicate activities**: Dedup by activity ID (Reddit message ID)
- **Stale activities**: Auto-archive after 7 days
- **Polling**: Every 5 min (faster than posts — activity is time-sensitive)
- **Rate limits**: `/message/inbox` counts toward 100 req/min — negligible
- **Notifications**: Desktop notification via Tauri for new high-value items
- **Per-sub prompt applies**: If r/reactjs prompt says "technical with code", drafts follow that style
- **"Edit & Send"**: Opens quick composer inline (not full post detail), user can edit before sending
- **History tab**: Shows last 50 acted-upon activities for reference
- **Keyboard shortcuts**: `J`/`K` to navigate, `Enter` to expand, `A` accept draft, `D` decline, `E` edit
