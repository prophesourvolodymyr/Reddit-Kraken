# F6 — Filter/Search

## Overview
Full-text search across all fetched posts with multi-filter support. SQLite FTS5 for fast local search.

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
│  • Score range       │
│  • Status            │
│  • Relevancy score   │
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
│  [Date: Any ▾]  [Score: Any ▾]  [Status: Any ▾]  [Clear]   │
│  ────────────────────────────────────────────────────────── │
│  Results (3 matching)                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ r/automation · Score 8 · 2h ago · Status: New       │   │
│  │ "Looking for Python script to automate CSV exports"  │   │
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
- Score range: Critical (9-10), Suggested (7-8), All
- Status filter: New, Analyzed, Reviewed, Drafted, Responded, Dismissed
- Combined: "python" + r/python + Score 7+ = narrow results
- Clear all filters one-click

## Nuances
- **Empty results**: "No posts match your search" with suggestion to broaden
- **Debounce**: 300ms delay on keystroke before search
- **Pagination**: Load 20 results, scroll for more
- **Sort**: By date (default) or by relevance score
- **FTS5 limitations**: Exact word matching, no fuzzy — but fast and local
