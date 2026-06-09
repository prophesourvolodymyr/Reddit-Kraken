# F4 — AI Composer

## Overview
AI-assisted reply composer for comments and new post creation. AI suggests, enhances, rewrites, and expands text. User always presses the final submit button.

## Reply Composer

```
┌───────────────────────────────────────────────────────────────┐
│  💬 Reply to: "Need help deploying Next.js to Vercel"        │
│  r/nextjs · u/johndoe · 3h ago                               │
│  ──────────────────────────────────────────────────────────── │
│  ┌─ AI Suggestions ──────────────────────────────────────────┐│
│  │  ⚡ Quick reply: "Have you checked your rewrites?"        ││
│  │  📝 Detailed: "This is a known Vercel issue. Fix is..."   ││
│  │  💬 Ask more: "What does your next.config look like?"     ││
│  └───────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Hey! I ran into this exact issue last month.            │  │
│  │                                                         │  │
│  │ The problem is your rewrites are hitting Vercel's       │  │
│  │ edge network...                    [🤖 AI Suggestion]   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  [🤖 Enhance] [🤖 Rewrite] [🤖 Fix Grammar] [🤖 Expand]      │
│                                                               │
│  [Cancel]                                    [Post to Reddit] │
└───────────────────────────────────────────────────────────────┘
```

## AI Assistance Modes

| Mode | Action | Prompt |
|------|--------|--------|
| **Suggest** | Shows 3 draft options (quick/detailed/ask) | "Given this post and user's expertise, suggest 3 reply options" |
| **Enhance** | Improves existing draft text | "Improve this reply: make it clearer, more helpful" |
| **Rewrite** | Full rewrite in user's style | "Rewrite this in a helpful, friendly tone" |
| **Fix Grammar** | Clean typos and grammar | "Fix grammar and typos only, preserve meaning" |
| **Expand** | Adds detail to short reply | "Expand this short reply with more specific guidance" |

## New Post Composer (FAB)

```
┌───────────────────────────────────────────────────────────────┐
│  ✍️ Create New Post                              [×] Close    │
│  ──────────────────────────────────────────────────────────── │
│                                                               │
│  Posting to:  [r/reactjs ▾]    ← auto-detected, changeable   │
│                                                               │
│  Post type:   ○ Text   ○ Link   ○ Image/Video                │
│                                                               │
│  Title:    ┌─────────────────────────────────────────────┐    │
│           │  [🤖 Suggest Title]                          │    │
│           └─────────────────────────────────────────────┘    │
│                                                               │
│  Body:     ┌─────────────────────────────────────────────┐    │
│           │                                              │    │
│           │  [🤖 Enhance] [🤖 Rewrite] [🤖 Expand]      │    │
│           └─────────────────────────────────────────────┘    │
│                                                               │
│  Flair:    [Choose Flair ▾]    NSFW: [ ]  Spoiler: [ ]      │
│  📎 Attach image...                                           │
│                                                               │
│  [Save Draft]                              [Post to Reddit ➔]│
└───────────────────────────────────────────────────────────────┘
```

## Auto-Detect Subreddit
- FAB detects which sub you're viewing in the sidebar
- Shows tooltip: "Posting to r/reactjs"
- User can change via dropdown
- If on General view → no auto-detect, user picks

## Image Upload
- Reddit API: POST to `https://oauth.reddit.com/api/upload_media`
- Accepts: `.jpg`, `.png`, `.gif` up to 20MB
- Returns media URL → embed in post body or link post

## Flow

```
User clicks FAB ──→ NewPostModal opens
                  → Subreddit auto-selected
                  → User writes title + body
                  → AI assists on demand
                  → User clicks "Post to Reddit"
                  → Rust backend calls POST /api/submit
                  → Post stored in local DB with status "responded"
```

## Nuances
- **Posting too fast**: Reddit rate limits — 1 post per 10min per sub
- **Deleted posts**: Handle API errors gracefully, show "Post failed" with retry
- **Drafts**: Store unsaved drafts in local SQLite (drafts table)
- **Markdown**: Reddit uses Markdown — editor should support preview
- **Character limits**: Title max 300 chars, body max 40000 chars
- **Flair**: Fetch available flairs via `GET /api/link_flair` per sub
