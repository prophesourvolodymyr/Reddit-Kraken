# F5 — Comment Analysis

## Overview
Fetches comments on scored posts, analyzes sentiment, identifies engagement opportunities, and surfaces insights to help the user decide where to reply.

## Flow

```
Post opened by user (or AI detects score > 7)
         │
         ▼
┌──────────────────────────────┐
│  Fetch comments via API      │
│  GET /comments/{post_id}     │
│  Limit: top 50 comments      │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Store in comments table     │
│  (dedup by comment_id)       │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Send to LLM with prompt:    │
│  "Analyze these comments:    │
│  - What's the overall        │
│    sentiment?                │
│  - Has OP's question been    │
│    answered?                 │
│  - Is there an opening for   │
│    the user to contribute?   │
│  - Which comment is most     │
│    worth replying to?"       │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  LLM Returns:                │
│  {                           │
│    sentiment: "frustrated",  │
│    question_answered: false, │
│    engagement_opportunity: true,
│    best_comment_to_reply: 2, │
│    reasoning: "Top comment   │
│      is wrong about X"       │
│  }                           │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Display in UI:              │
│  • 🧠 AI Insight card below │
│    each comment              │
│  • "Best reply target" badge│
│  • Summary in AIPanel        │
└──────────────────────────────┘
```

## Comment Display in PostDetail

```
"OP is frustrated, top comment is incomplete.
Your expertise on Vercel deployments is a direct match.
Consider replying to comment #3 — user still needs help."
                                    ↑ AI insight card
┌─────────────────────────────────────────────┐
│ u/dev_guru · 2h ago                        │
│ "Try removing the rewrites temporarily..."  │
│ ┌───────────────────────────────────────┐  │
│ │ 🧠 AI: This is correct but           │  │
│ │ incomplete. OP likely needs the      │  │
│ │ full next.config fix, not just       │  │
│ │ troubleshooting advice.              │  │
│ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## SQLite

Comments already stored in `comments` table (from F1). Add:

```sql
ALTER TABLE comments ADD COLUMN ai_insight TEXT;
ALTER TABLE posts ADD COLUMN comment_analysis_json TEXT;
```

## Nuances
- **Nested threads**: Reddit returns threaded comments — flatten for LLM input
- **More comments**: Use `?limit=200&depth=1` for flat view, less context for LLM
- **Deleted comments**: Skip `[deleted]` authors
- **Locked threads**: Don't analyze — no point suggesting reply
- **Old posts**: Skip comment analysis if post is > 7 days old
- **Cost**: Only analyze comments when user opens post or AI score > 7
