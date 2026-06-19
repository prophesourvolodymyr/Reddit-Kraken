# F02 — Reddit Data Pipeline

Full read/write access to Reddit: fetch posts in real-time, load comment threads, extract subreddit metadata (icons, colors, stats), submit posts and comments, and pull notifications. All data flows through SQLite cache with Reddit API as source of truth.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Frontend                             │
│  PostList ──→ get_posts() ──→ Reddit API (live)          │
│  PostDetail ─→ get_post_detail() ─→ Reddit API (comments)│
│  Sidebar ───→ get_subreddits() ──→ SQLite (metadata)    │
│  AddSubredditModal → add_subreddit() → Reddit API (about)│
│  FAB ───────→ NewPostModal (submit stub)                 │
│  InboxView ─→ (notifications stub)                       │
├──────────────────────────────────────────────────────────┤
│                      Backend                              │
│  lib.rs commands → reddit_api.rs → reqwest → reddit.com  │
│                   → db.rs → SQLite                       │
│  scheduler.rs → background poll every 15 min             │
└──────────────────────────────────────────────────────────┘
```

## Sub-Features

| Code | Name | Status |
|------|------|--------|
| F02-A | Post Fetching | `in_progress` |
| F02-B | Comment Fetching | `in_progress` |
| F02-C | Subreddit Metadata | `in_progress` |
| F02-D | Content Submission | `pending` |
| F02-E | Notifications | `pending` |

## Dependencies

- F01 — must have valid Reddit client (any auth mode)

## Verification

- [ ] Click subreddit → posts appear within 2 seconds
- [ ] Click post → comments load with threading
- [ ] Subreddit icons display in sidebar
- [ ] Import subscriptions imports all subscribed subs
- [ ] Scheduler polls every 15 min, stores new posts
