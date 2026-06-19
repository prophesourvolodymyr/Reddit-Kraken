# F05 — Cross-Posting

The killer feature: write one master post, tailor it per community, post across multiple subreddits at once or on a schedule. Each subreddit gets its own editing panel for individual adjustments (flairs, attachments, text, timing). AI adapts content per community tone. Full batch saved as draft. Sequential posting with progress tracking.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Cross-Post Editor                                       │
│                                                          │
│  ┌─ Master Post ───────────────────────────────────────┐ │
│  │  Title + Body + AI buttons (Enhance/Rewrite/Expand) │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                          │
│  Select subreddits: [r/reactjs] [r/webdev] [r/startups]  │
│  [+ Add subreddit]                                       │
│                                                          │
│  ┌─ r/reactjs ────────┐ ┌─ r/webdev ──────────────────┐ │
│  │ Title (editable)   │ │ Title (editable)             │ │
│  │ Body (editable)    │ │ Body (editable)              │ │
│  │ Flair: [dropdown]  │ │ Flair: [dropdown]            │ │
│  │ 📎 Attachment      │ │ 📎 Link                      │ │
│  │ NSFW ☐ Spoiler ☐  │ │ Spoiler ☐                    │ │
│  │ Schedule: [Now ▾]  │ │ Schedule: [2 hours ▾]        │ │
│  │ [AI Adapt] [Copy  ]│ │ [AI Adapt] [Copy from Master]│ │
│  │        from Master │ │ [Remove]                     │ │
│  └────────────────────┘ └──────────────────────────────┘ │
│                                                          │
│  [Schedule All]  [Post All Now]  [Save Draft]  [Cancel]  │
└──────────────────────────────────────────────────────────┘
```

## Sub-Features

| Code | Name | Status |
|------|------|--------|
| F05-A | Editor | `pending` |
| F05-B | AI Adapt | `pending` |
| F05-C | Scheduling | `pending` |
| F05-D | Drafts | `pending` |
| F05-E | Posting | `pending` |

## Dependencies

- F02-C — subreddit metadata (flairs, icons)
- F02-D — content submission (POST /api/submit)
- F04-C — AI reply generation (AI Adapt uses similar prompt)
- F04-D — text enhance (rewrite/expand buttons)

## DB Schema

```sql
CREATE TABLE cross_post_drafts (
    id TEXT PRIMARY KEY,
    master_title TEXT NOT NULL,
    master_body TEXT,
    created_at TEXT, updated_at TEXT,
    status TEXT DEFAULT 'draft'
);

CREATE TABLE cross_post_items (
    id TEXT PRIMARY KEY,
    draft_id TEXT REFERENCES cross_post_drafts(id) ON DELETE CASCADE,
    subreddit_id TEXT REFERENCES subreddits(id),
    title TEXT NOT NULL, body TEXT,
    flair_id TEXT, flair_text TEXT,
    nsfw INTEGER DEFAULT 0, spoiler INTEGER DEFAULT 0,
    attachment_url TEXT, tags TEXT,
    schedule_at TEXT,
    posted_at TEXT, post_result TEXT,
    sort_order INTEGER DEFAULT 0
);
```
