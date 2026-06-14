# F4 — Cross-Posting

## Overview
The killer feature: write one post, tailor it per community, then post across multiple subreddits individually or on a schedule. Each community gets its own editing window for individual adjustments (flairs, attachments, text). Full batch can be saved as a draft.

## Cross-Post Editor Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  ✍️ Cross-Post                                          [Save Draft] │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  ┌─ Master Post ───────────────────────────────────────────────────┐ │
│  │  Title:    ┌────────────────────────────────────────────────┐   │ │
│  │           │  Our new API is live — what we learned building  │   │ │
│  │           │  a Reddit scheduling tool                       │   │ │
│  │           └────────────────────────────────────────────────┘   │ │
│  │                                                                  │ │
│  │  Body:     ┌────────────────────────────────────────────────┐   │ │
│  │           │  After 6 months of building, we're launching...  │   │ │
│  │           │                                                   │   │ │
│  │           │  Key features:                                    │   │ │
│  │           │  • Schedule posts across multiple subreddits      │   │ │
│  │           │  • Per-community customization                    │   │ │
│  │           │  • AI-assisted content adaptation                 │   │ │
│  │           │                                                   │   │ │
│  │           │  [🤖 Enhance] [🤖 Rewrite] [🤖 Expand]           │   │ │
│  │           └────────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Select communities to post in: [+ Add subreddit]                    │
│                                                                      │
│  ┌─ r/reactjs ─────────────────────────┐ ┌─ r/webdev ─────────────┐ │
│  │                                     │ │                         │ │
│  │ Title: [adjusted for reactjs...]   │ │ Title: [same as master] │ │
│  │                                     │ │                         │ │
│  │ Body:  [tweaked for react crowd]   │ │ Body:  [webdev version] │ │
│  │         ...                         │ │         ...              │ │
│  │                                     │ │                         │ │
│  │ Flair: [Show & Tell ▾]             │ │ Flair: [Resource ▾]     │ │
│  │                                     │ │                         │ │
│  │ 📎 + Attachment                     │ │ 📎 + Link               │ │
│  │ [!] NSFW   [S] Spoiler             │ │ [S] Spoiler             │ │
│  │                                     │ │                         │ │
│  │ Tags: [#react #api #tooling]       │ │ Tags: [#webdev #tool]   │ │
│  │                                     │ │                         │ │
│  │ Schedule: [Now ▾]                  │ │ Schedule: [Now ▾]       │ │
│  │                                     │ │                         │ │
│  │ [🤖 AI Adapt]  [🗑 Remove]         │ │ [🤖 AI Adapt]  [🗑 Rem]│ │
│  │ [Copy from Master]                  │ │ [Copy from Master]      │ │
│  └─────────────────────────────────────┘ └─────────────────────────┘ │
│                                                                      │
│  ┌─ r/startups ────────────────────────────────────────────────────┐ │
│  │  ... same per-community panel ...                                │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────── │
│  [Schedule All]    [Post All Now]    [Save as Draft]    [Cancel]     │
└──────────────────────────────────────────────────────────────────────┘
```

## Per-Community Panel

Each subreddit gets its own panel (grid layout, 2 per row on larger screens):

1. **Title** — starts as copy of master, editable
2. **Body** — starts as copy of master, editable
3. **Flair** — fetched from subreddit's available flairs
4. **Attachments** — per-community images/links
5. **Individual tags** — subreddit-specific tags/labels
6. **Spoiler/NSFW** — per-community toggles
7. **Schedule** — now, later, or custom time per community
8. **AI Adapt button** — automatically rewrites for the community's tone
9. **Copy from Master** — resets to master content
10. **Remove** — removes this community from the batch

## Schedule Options

Per community or per batch:

```
┌──────────────────────────────────────────┐
│  Schedule: [Now ▾]                       │
│                                          │
│  ○ Post now                              │
│  ○ Post in [30] minutes                  │
│  ○ Post in [2] hours                     │
│  ○ Schedule for: [date] [time]          │
│  ○ Add to queue (post when ready)       │
└──────────────────────────────────────────┘
```

**Batch scheduling**: Each community can have independent schedule or inherit from batch.

## Draft System

```
┌──────────────────────────────────────────┐
│  Drafts                                   │
│                                          │
│  Every cross-post batch IS a draft until  │
│  posted.                                  │
│                                          │
│  Auto-save:                               │
│  • Debounced save after every keystroke   │
│  • Draft ID generated on first edit       │
│  • Stored in SQLite as JSON blob          │
│                                          │
│  Recovery:                                │
│  • On launch: check for unsent drafts     │
│  • Show recovery toast                    │
│  • Reopen draft in editor                 │
│                                          │
│  Drafts view:                             │
│  • Accessible from Cross-Post tab         │
│  • List of saved drafts with preview      │
│  • Click to resume editing                │
│  • Delete with confirmation               │
└──────────────────────────────────────────┘
```

## Posting Flow

```
User clicks [Post All Now]
         │
         ▼
┌──────────────────────────────────────┐
│  Confirmation dialog:                │
│  "Post to 3 subreddits?"             │
│  ✓ r/reactjs  (now)                  │
│  ✓ r/webdev   (now)                  │
│  ✓ r/startups (now)                  │
│  [Cancel] [Post]                     │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Sequential posting (1 sub at a time) │
│                                      │
│  ┌─ r/reactjs ──→ POST /api/submit  │
│  │  ✓ Posted                         │
│  │                                    │
│  │  ┌─ r/webdev ──→ POST /api/submit│
│  │  │ ✓ Posted                       │
│  │  │                                │
│  │  │  ┌─ r/startups → POST /submit │
│  │  │  │ ✓ Posted                    │
│  │  │  │                              │
│  │  │  │  All 3 posted successfully  │
│  │  │  │                              │
│  │  │  │  [View Posts] [Done]        │
│  └──┴──┴─────────────────────────────┘
│                                      │
│  On failure: stop, show error,       │
│  mark remaining as "pending retry"   │
└──────────────────────────────────────┘
```

## Scheduled Queue

When posts are scheduled for later:

```
┌──────────────────────────────────────────────────────────────┐
│  📅 Scheduled Queue                              [Clear All] │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  Tomorrow, 9:00 AM                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ "Our API is live" → r/reactjs                        │   │
│  │ "Our API is live" → r/webdev                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Jun 16, 2:00 PM                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ "What we learned building..." → r/startups           │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## SQLite Schema

```sql
CREATE TABLE cross_post_drafts (
  id TEXT PRIMARY KEY,           -- UUID
  master_title TEXT NOT NULL,
  master_body TEXT,
  master_type TEXT DEFAULT 'text',  -- text | link | image
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT,
  status TEXT DEFAULT 'draft'    -- draft | scheduled | posted | archived
);

CREATE TABLE cross_post_items (
  id TEXT PRIMARY KEY,           -- UUID
  draft_id TEXT NOT NULL REFERENCES cross_post_drafts(id) ON DELETE CASCADE,
  subreddit_id TEXT NOT NULL REFERENCES subreddits(id),
  title TEXT NOT NULL,
  body TEXT,
  flair_id TEXT,
  flair_text TEXT,
  nsfw INTEGER DEFAULT 0,
  spoiler INTEGER DEFAULT 0,
  attachment_url TEXT,
  tags TEXT,                     -- JSON array
  schedule_at TEXT,              -- NULL = post now
  posted_at TEXT,
  post_result TEXT,              -- JSON: {id, url} or {error}
  sort_order INTEGER DEFAULT 0
);
```

## AI Adaptation

The "🤖 AI Adapt" button in each community panel:

```
Prompt:
"Adapt this post for r/{subreddit_name}.
Tone should match the community.
Keep the core message but adjust:
- Technical depth (r/reactjs = technical, r/startups = business)
- Examples and references
- Call to action style
Original post: {master_body}"
```

User can then further edit the AI-adapted content manually.

## Nuances & Edge Cases
- **Rate limits**: Reddit limits 1 post per 10min per sub — sequential posting respects this
- **Ban detection**: If sub returns 403 on post, mark subreddit in sidebar as "restricted"
- **Deleted community**: If sub deleted while draft open, show warning
- **Large batches**: 10+ communities — show scrollable grid, paginate
- **Attachment limits**: Reddit allows 1 image per post, up to 20MB
- **Markdown preview**: Toggle between edit and preview per panel
- **Character counter**: Title max 300, body max 40000 per Reddit limits
- **Undo close**: If user closes editor, confirm "Save draft before closing?"
- **Crash recovery**: Drafts auto-saved to SQLite, recovered on next launch
- **Cross-post from FAB**: Single-sub quick post has "Open in Cross-Post Editor" button
