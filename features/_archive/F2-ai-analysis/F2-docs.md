# F2 — AI Engagement

## Overview
Minimal AI that evaluates fetched posts and flags the best ones worth responding to. No complex scoring. No embeddings. No per-comment analysis. The app remembers what you've seen so you never re-review the same posts.

## Pipeline

```
Post fetched (seen=0)
         │
         ▼
┌──────────────────────────────┐
│  Skip if user already seen   │  ← App memory: seen=1 posts are never re-evaluated
│  Skip if post > 3 days old   │
└──────────┬───────────────────┘
           │ new + unseen + recent
           ▼
┌──────────────────────────────┐
│  LLM Evaluation Call         │  ← OpenAI GPT-4o-mini (single prompt)
│  Input:                      │
│  • Post title + body         │
│  • User interest profile     │
│  • Top 3 comments (for       │
│    context, not analysis)    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  LLM Returns JSON:           │
│  {                           │
│    "worth_responding": true, │
│    "reason": "They're asking │
│      about Vercel rewrites — │
│      your exact expertise"   │
│  }                           │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Update Post:                │
│  worth_responding = 1        │
│  ai_reason = "..."           │
│                              │
│  User sees simple badge in   │
│  UI: ✦ Worth responding     │
└──────────────────────────────┘
```

## What Changed From V1
- **Removed**: Embeddings (fastembed-rs), score 0-10 system, urgency levels, 7-step status pipeline, per-comment AI insights
- **Kept**: Interest profile, per-sub prompts (optional), LLM evaluation
- **Added**: App memory (seen tracking), binary flag, daily digest categorization

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

Stored as plain text in SQLite (fed to LLM prompts). No embeddings needed.

### Per-Sub Prompts (optional)

```
r/learnpython: "Look for beginners struggling with file I/O"
r/startups: "Find people launching MVP, offer marketing advice"
r/reactjs: "Help with hooks, useEffect patterns, Next.js"
```

## App Memory

The app tracks what you've seen and never re-evaluates old content:

```
seenas SQLite columns:
  posts.seen = 1        → user scrolled past this post
  posts.worth_responding = 1  → AI flagged it

Logic:
  1. When user scrolls → mark posts as seen in viewport
  2. When user opens post detail → mark seen
  3. When LLM evaluates → skip posts where seen=1
  4. On next poll cycle → only evaluate unseen posts
  5. User NEVER sees the same "worth responding" twice
```

## Daily Digest Categorization

Posts flagged as `worth_responding` are grouped by day + channel for the For You Digested view:

```
Today — r/reactjs
  ✦ "How do I handle rewrites in Next.js config?"
  ✦ "useEffect running twice in production build?"

Yesterday — r/startups
  ✦ "Just launched my MVP — now what?"

2 days ago — r/python
  ✦ "Need help with async file processing"
```

No separate table needed — `SELECT * FROM posts WHERE worth_responding=1 ORDER BY created_utc DESC, subreddit_id` with UI grouping.

## SQLite (minimal additions to F1 schema)

```sql
-- Already in F1 posts table:
-- worth_responding INTEGER DEFAULT 0
-- ai_reason TEXT
-- seen INTEGER DEFAULT 0

CREATE TABLE user_profile (
  id INTEGER PRIMARY KEY,
  content TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sub_prompts (
  subreddit_id TEXT PRIMARY KEY REFERENCES subreddits(id),
  prompt TEXT
);
```

## LLM Prompt Template

```
System: You evaluate if a Reddit post is worth the user responding to.
Reply with JSON: {"worth_responding": true/false, "reason": "..."}

User profile: {profile_text}
Per-sub notes: {sub_prompt_or_empty}

Post title: {title}
Post body: {body_truncated_4000}
Top comments: {comments_summary}

Is this worth the user responding to?
```

## Cost-Aware Design

| Strategy | Savings |
|----------|---------|
| Skip posts where `seen=1` | ~80% reduction per cycle |
| Skip posts older than 3 days | ~10% reduction |
| Batch 5 posts per LLM call | ~80% fewer API calls |
| GPT-4o-mini only | ~90% cheaper than GPT-4o |
| No re-analysis ever | Zero redundant cost |

## Nuances & Edge Cases
- **Profile empty**: Default to "general helpful tech person" persona
- **Post too long**: Truncate to 4000 chars before LLM
- **Non-English**: Still works, LLM adapts
- **Image/video posts**: Title only, lower confidence but functional
- **Profile change**: Re-evaluate only unseen posts with new profile
- **LLM failure**: Retry once, skip post on second failure
- **Batch failure**: If batch fails, evaluate posts individually
