# F2 — AI Analysis

## Overview
Takes fetched posts, matches them against user's interest profile, scores 1-10, assigns status. Uses local embeddings for pre-filtering + LLM for deep analysis.

## Pipeline

```
Post fetched (status: new)
         │
         ▼
┌──────────────────────┐
│  Embed post (local)  │ ← fastembed-rs (all-MiniLM-L6-v2)
│  Compare to profile  │ ← cosine similarity
│  Similarity > 0.5?   │──no──→ status: "dismissed" (score: 0-2)
└──────────┬───────────┘
           │ yes
           ▼
┌──────────────────────┐
│  LLM Analysis Call   │ ← OpenAI (GPT-4o-mini for cost)
│  Input:              │
│  • Post title + body │
│  • Top 5 comments    │
│  • User profile      │
│  • Per-sub prompt    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  LLM Returns JSON:   │
│  {                   │
│    score: 8,         │
│    urgency: "high",  │
│    reason: "...",    │
│    worth_responding: true,
│    suggested_action: "reply",
│    comment_insights: "..."
│  }                   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Update Post:        │
│  score: 8            │
│  status: "analyzed"  │
│  alert if > 7        │
└──────────────────────┘
```

## Interest Profile

User writes a free-form profile:

```
I'm a solo developer building a Python desktop app.
I can help with:
- Python debugging & automation
- Indie marketing & growth
- React/Next.js frontend issues
- Deployment to Vercel/Railway
```

Stored as:
- Raw text (fed to LLM prompts)
- Embedding vector (cosine sim pre-filter)

### Per-Sub Prompts (optional)

```
r/learnpython: "Look for beginners struggling with file I/O"
r/startups: "Find people launching MVP, offer marketing advice"
r/reactjs: "Help with hooks, useEffect patterns, Next.js"
```

## Scoring Model

| Score | Label | Meaning |
|-------|-------|---------|
| 9-10 | Critical | Someone asking for your exact solution |
| 7-8 | Suggested | Strong relevance, you have expertise |
| 4-6 | Background | Tangential, maybe worth a read |
| 1-3 | Low | Not relevant |
| 0 | Ignore | Spam, off-topic, deleted |

## Status System

```
new ──→ analyzed ──→ reviewed ──→ drafted ──→ responded
                ↘ dismissed
                ↘ archived
```

- **new**: Freshly fetched, not yet analyzed
- **analyzed**: AI has scored it
- **reviewed**: User has opened/seen the post
- **drafted**: User started composing a reply
- **responded**: User posted the reply
- **dismissed**: User actively skipped
- **archived**: Old, hidden from default view

## SQLite Schema Additions

```sql
ALTER TABLE posts ADD COLUMN analysis_json TEXT;
ALTER TABLE posts ADD COLUMN analysis_at TEXT;
ALTER TABLE posts ADD COLUMN urgency TEXT; -- high/medium/low

CREATE TABLE user_profile (
  id INTEGER PRIMARY KEY,
  content TEXT NOT NULL,           -- free-form interest profile
  embedding BLOB,                  -- stored vector
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sub_prompts (
  subreddit_id TEXT PRIMARY KEY REFERENCES subreddits(id),
  prompt TEXT
);
```

## Cost-Aware Design

| Strategy | Savings |
|----------|---------|
| Embedding pre-filter | ~60% of posts filtered before LLM |
| GPT-4o-mini (not 4o) | ~90% cheaper per call |
| Batch 5 posts per LLM call | ~80% fewer API calls |
| Skip analysis for score < 3 | No second pass |
| Only analyze "new" posts | No re-analysis |

## Nuances & Edge Cases
- **Post too long**: Truncate title/body to ~4000 chars before LLM
- **Non-English posts**: Still works, just might score differently
- **Image/video posts**: Only have title, caption-limited — lower confidence
- **Profile changes**: Re-analyze only posts with status "new" after profile update
- **Embedding model**: Load once at startup, ~100MB RAM
- **LLM failure**: Retry once, then mark as "dismissed" with score 0
- **Empty profile**: Score based on general helpfulness instead
