# F1 — Reddit Fetching

## Overview
Background service that polls the Reddit API for each subscribed subreddit, stores posts/comments in SQLite, handles auth, rate limits, and archiving state.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Tauri Scheduler (tokio cron)                           │
│  Every 15min (per sub, configurable)                    │
│                                                         │
│  ┌─────────────────┐     ┌─────────────────────────┐   │
│  │  Poll r/reactjs  │────→│  Reddit API             │   │
│  │  Poll r/startups │     │  GET /r/{sub}/new       │   │
│  │  Poll r/python   │     │  Limit: 25              │   │
│  └────────┬─────────┘     └─────────────────────────┘   │
│           │                                              │
│           ▼                                              │
│  ┌──────────────────────────────────────────────┐       │
│  │  Dedup by post_id                             │       │
│  │  Only insert new posts                        │       │
│  └──────────────────┬───────────────────────────┘       │
│                     ▼                                    │
│  ┌──────────────────────────────────────────────┐       │
│  │  SQLite                                        │       │
│  │  posts, comments, subreddits, auth            │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

## Auth (Script App)
- Register app at https://www.reddit.com/prefs/apps → type: Script
- Use `grant_type=password` with username + password
- Token lasts 1 hour, auto-refresh via `refresh_token`
- Scopes: `read`, `submit`, `identity`, `privatemessages`, `history`

```
POST https://www.reddit.com/api/v1/access_token
Authorization: Basic base64(client_id:client_secret)
Body: grant_type=password&username=USER&password=PASS

Response:
{ "access_token": "...", "token_type": "bearer", "expires_in": 3600, "refresh_token": "..." }
```

## API Endpoints Used

| Endpoint | Purpose | Scope |
|----------|---------|-------|
| `GET /r/{sub}/new` | Fetch new posts | `read` |
| `GET /r/{sub}/hot` | Fetch hot posts | `read` |
| `GET /r/{sub}/about` | Get subreddit metadata (icon, name) | `read` |
| `GET /comments/{article}` | Fetch comments on a post | `read` |
| `POST /api/comment` | Reply to post/comment | `submit` |
| `POST /api/submit` | Create new post (single + cross-post) | `submit` |
| `GET /api/v1/me` | Verify identity | `identity` |

## Rate Limiting
- 100 requests per minute per OAuth token
- Exponential backoff on 429 responses
- Queue requests if approaching limit
- One poll cycle for 10 subs × 2 endpoints = ~20 req/15min → well within limits

## Archiving Hooks

The app must handle graceful and unexpected shutdowns:

```
┌─────────────────────────────────────────┐
│  Normal Close (Cmd+Q / window close)     │
│                                         │
│  1. Tauri on_window_close event fires   │
│  2. If drafts exist → prompt:           │
│     "You have unsaved drafts.           │
│      [Save All] [Discard] [Cancel]"     │
│  3. If cross-post batch open → prompt:  │
│     "Save this batch as draft?"         │
│  4. Auto-archive completed posts        │
│     (age > 14 days, move to archive)    │
│  5. Persist app state (active sub,      │
│     scroll position, open tabs)         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Unexpected Close (crash / force quit)  │
│                                         │
│  1. On next launch: detect unclean      │
│     exit via sentinel file or           │
│     last_state flag in SQLite          │
│  2. Auto-recover in-progress drafts     │
│     (stored every keystroke debounced)  │
│  3. Show recovery toast:                │
│     "Recovered 2 drafts from last       │
│      session"                           │
│  4. Re-open last active subreddit       │
└─────────────────────────────────────────┘
```

State persisted in SQLite:

```sql
CREATE TABLE app_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- Stores: last_active_sub, active_view, window_geometry, exit_status
```

## SQLite Schema

```sql
CREATE TABLE subreddits (
  id TEXT PRIMARY KEY,           -- Reddit subreddit ID (t5_*)
  name TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  added_at TEXT DEFAULT (datetime('now')),
  poll_interval INTEGER DEFAULT 15,
  enabled INTEGER DEFAULT 1
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,           -- Reddit post ID (t3_*)
  subreddit_id TEXT NOT NULL REFERENCES subreddits(id),
  title TEXT NOT NULL,
  body TEXT,
  author TEXT,
  url TEXT,
  score INTEGER DEFAULT 0,
  num_comments INTEGER DEFAULT 0,
  created_utc REAL,
  flair_text TEXT,
  over_18 INTEGER DEFAULT 0,
  spoiler INTEGER DEFAULT 0,
  fetched_at TEXT DEFAULT (datetime('now')),
  seen INTEGER DEFAULT 0,       -- user has viewed this post
  saved INTEGER DEFAULT 0,      -- saved to a folder
  worth_responding INTEGER DEFAULT 0,  -- AI flag
  ai_reason TEXT,
  archived INTEGER DEFAULT 0    -- auto-archived after 14 days
);

CREATE TABLE comments (
  id TEXT PRIMARY KEY,           -- Reddit comment ID (t1_*)
  post_id TEXT NOT NULL REFERENCES posts(id),
  parent_id TEXT,                -- parent comment or post ID
  author TEXT,
  body TEXT,
  score INTEGER DEFAULT 0,
  created_utc REAL,
  fetched_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE auth (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- Stores: access_token, refresh_token, client_id, client_secret, username
```

## Nuances & Edge Cases
- **Deleted posts**: Reddit API still returns them with `[deleted]` author — skip or mark
- **Private subs**: API returns 403, mark sub as unavailable
- **Empty subs**: No posts returned is valid — don't treat as error
- **Network failures**: Retry 3 times with backoff, log failure, try next cycle
- **First run**: No backfill — start fresh, populate gradually
- **Duplicate fetches**: Dedup by post_id (INSERT OR IGNORE)
- **Token expiry**: Check before each poll cycle, refresh if needed
- **Subreddit not found**: API returns 404, disable sub and notify user
- **Pagination**: Use `after` param to fetch more than 25 per cycle if needed
- **Archiving**: Posts older than 14 days auto-flagged `archived=1`, hidden from default views but searchable
- **Unclean exit recovery**: On startup, check `app_state.exit_status != 'clean'`, recover drafts
