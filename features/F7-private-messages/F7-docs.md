# F7 — Private Messages

## Overview
Full Reddit private messaging: inbox, unread, sent, compose, delete. AI-assisted replies for PMs too.

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
│  │    [🤖 Suggest Reply]                           │   │
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
│           │                                           │  │
│           └──────────────────────────────────────────┘  │
│  Message: ┌──────────────────────────────────────────┐  │
│           │                                           │  │
│           │  [🤖 Enhance] [🤖 Rewrite] [🤖 Expand]   │  │
│           └──────────────────────────────────────────┘  │
│                                                          │
│  [Cancel]                         [Send Message ➔]      │
└──────────────────────────────────────────────────────────┘
```

## Nuances
- **Polling**: Check inbox every 5 min (not 15 like posts — PMs are time-sensitive)
- **Notifications**: Show unread count badge on Inbox tab + system notification
- **Threaded**: Reddit messages are threaded — group by subject
- **Mod messages**: Subreddit mod messages also appear in inbox (distinct icon)
- **Delete**: Mark as deleted locally + call API to delete
- **Rate limit**: Max 1 PM per 10 seconds
- **Read receipts**: Mark as read when user opens the message
- **AI assist**: Same composer as F4 — suggest, enhance, rewrite on PM replies
