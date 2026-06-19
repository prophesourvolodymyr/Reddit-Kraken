# F09 — Saved Folders

Organize saved posts into folders. Create, rename, delete folders. Save/unsave posts. Move posts between folders. Drag-and-drop into folders. Batch operations.

## Sub-Features

| Code | Name | Status |
|------|------|--------|
| F09-A | Folder Management | `pending` |
| F09-B | Content Organization | `pending` |

## DB Schema (Future)

```sql
CREATE TABLE saved_folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE saved_items (
    id TEXT PRIMARY KEY,
    folder_id TEXT REFERENCES saved_folders(id) ON DELETE SET NULL,
    post_id TEXT REFERENCES posts(id),
    saved_at TEXT DEFAULT (datetime('now')),
    sort_order INTEGER DEFAULT 0
);
```

## Dependencies

- F02-A — posts must be fetched and stored first
