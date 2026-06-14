# F7 — Private Messages

## Overview
Full Reddit private messaging: inbox, unread, sent, compose, delete. AI can suggest replies on demand but never auto-responds.

## Reddit PM API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/message/inbox` | GET | Fetch inbox messages |
| `/message/unread` | GET | Fetch unread messages |
| `/message/sent` | GET | Fetch sent messages |
| `/api/compose` | POST | Send a private message |
| `/api/del_msg` | POST | Delete a message |
| `/api/read_message` | POST | Mark message as read |
| `/api/read_all_messages` | POST | Mark all as read |

## Data Flow

```
┌────────────────────────────────────────────────────────┐
│  Scheduler (every 5 min)                               │
│  ┌────────────┐                                        │
│  │ Fetch inbox│──→ Store new in messages table         │
│  │ Fetch unread│──→ Update unread_count for badge      │
│  └────────────┘                                        │
└────────────────────────────────────────────────────────┘

User opens Inbox tab
         │
         ▼
┌───────────────────────┐
│  Query messages table  │
│  WHERE type = inbox    │
│  ORDER BY created DESC │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Display in InboxView  │
│  • Unread highlighted  │
│  • Sender, subject,    │
│    time, preview       │
│  • Click to open       │
└───────────────────────┘
```

## SQLite Schema

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,           -- Reddit message ID (t4_*)
  type TEXT NOT NULL,            -- inbox | sent | unread
  from_user TEXT,
  to_user TEXT,
  subject TEXT,
  body TEXT,
  was_read INTEGER DEFAULT 0,
  created_utc REAL,
  fetched_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE message_drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_user TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

## Inbox View

```
┌──────────────────────────────────────────────────────────┐
│  📬 Messages                    [✍️ Compose] [🗑️]       │
│  ─────────────────────────────────────────────────────── │
│  [Inbox]  [Unread (3)]  [Sent]                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ● ● u/dev_guru · 2h ago                         │   │
│  │ │  "Re: Your comment about Next.js..."          │   │
│  │ └────────────────────────────────────────────── │   │
│  │    Hey! I saw your comment about Vercel...      │   │
│  │  ─────────────────────────────────────────────   │   │
│  │    [🤖 Suggest Reply]  [Reply]                  │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ○ u/johndoe · 5h ago                             │   │
│  │ │  "Thanks for the help!"                        │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## Compose PM

```
┌──────────────────────────────────────────────────────────┐
│  ✍️ New Message                              [×] Close  │
│  ─────────────────────────────────────────────────────── │
│  To:     ┌──────────────────────────────────────────┐   │
│         │  username                                  │   │
│         └──────────────────────────────────────────┘   │
│  Subject: ┌──────────────────────────────────────────┐  │
│          │                                            │  │
│          └──────────────────────────────────────────┘  │
│  Body:    ┌──────────────────────────────────────────┐  │
│          │                                            │  │
│          │  [🤖 Enhance] [🤖 Fix Grammar]            │  │
│          └──────────────────────────────────────────┘  │
│                                                         │
│  [Save Draft]                              [Send ➔]    │
└──────────────────────────────────────────────────────────┘
```

## Nuances
- **No auto-respond**: AI never sends replies automatically. User always clicks [Send].
- **AI suggestion**: Manual button, user initiates. Shows draft, user edits before sending.
- **Rate limits**: PMs also subject to Reddit rate limits
- **Blocked users**: Handle API errors gracefully
- **Multiple recipients**: Reddit PM is always 1-to-1, no group messages
- **Message search**: Search within messages via SQLite
- **Desktop notification**: Tauri notification for new unread messages
