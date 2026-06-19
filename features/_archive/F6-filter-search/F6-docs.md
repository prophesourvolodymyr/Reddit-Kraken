# F6 — Filter/Search

## Overview
Full-text search across all fetched posts with multi-filter support. SQLite FTS5 for fast local search. Also supports searching saved posts within folders.

## Architecture

```
User types in search bar
         │
         ▼
┌──────────────────────┐
│  SQLite FTS5 Query   │
│  SELECT FROM         │
│  posts_fts           │
│  WHERE posts_fts     │
│  MATCH 'query'       │
│  AND filters...      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Apply Filters:      │
│  • Subreddit         │
│  • Date range        │
│  • Worth responding  │
│  • Saved/not saved   │
│  • Archived          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Results sorted by   │
│  relevancy or date   │
└──────────────────────┘
```

## Filter Bar

```
┌──────────────────────────────────────────────────────────────┐
│  🔍 Search across all posts...          [Subreddit: All ▾]  │
│  [Date: Any ▾]  [Worth: Any ▾]  [Saved: Any ▾]  [Clear]    │
│  ────────────────────────────────────────────────────────── │
│  Results (3 matching)                    [Export Links]     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ r/reactjs · ✦ Worth responding · 2h ago             │   │
│  │ "How do I handle rewrites in Next.js config?"       │   │
│  │  → reddit.com/r/reactjs/comments/abc123/            │   │
│  │                              [Save to Folder]        │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## FTS5 Table

```sql
CREATE VIRTUAL TABLE posts_fts USING fts5(
  title, body, subreddit_name,
  content='posts',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync with posts table
CREATE TRIGGER posts_ai AFTER INSERT ON posts BEGIN
  INSERT INTO posts_fts(rowid, title, body, subreddit_name)
  VALUES (new.rowid, new.title, new.body,
    (SELECT name FROM subreddits WHERE id = new.subreddit_id));
END;

-- Similar for UPDATE and DELETE
```

## Search Features
- Full-text search on title + body
- Subreddit filter dropdown (auto-populated from subscribed subs)
- Date range: Today, This week, This month, Custom
- Worth responding filter: Any, Yes only, No
- Saved filter: Any, Saved in folder, Not saved
- Combined filter logic (AND across filters)
- Clear all filters one-click
- **Batch export links**: Select posts → copy/download list of Reddit URLs

## Batch Export Links

```
┌──────────────────────────────────────────┐
│  Export Links from Search Results        │
│                                          │
│  Select: [All] [None] [Worth responding] │
│                                          │
│  ☑ r/reactjs/comments/abc123/           │
│  ☑ r/webdev/comments/def456/            │
│  ☐ r/python/comments/ghi789/            │
│                                          │
│  [Copy to Clipboard] [Download .txt]    │
└──────────────────────────────────────────┘
```

## Nuances
- **Empty results**: "No posts match your search" with suggestion to broaden
- **Debounce**: 300ms delay on keystroke before search
- **Pagination**: Load 20 results, scroll for more
- **Sort**: By date (default) or by relevance score
- **FTS5 limitations**: Exact word matching, no fuzzy — but fast and local
- **Export**: Copy all selected post URLs to clipboard or download as .txt
