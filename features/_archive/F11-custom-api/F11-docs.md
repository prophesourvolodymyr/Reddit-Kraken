# F11 — Custom API

## Overview
A local loopback-only HTTP API that mirrors all visual posting features — cross-post, schedule, drafts, saved folders. Authenticated by a local token. Enables scripting and external tool integration.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  External script / tool                                   │
│  curl -H "Authorization: Bearer $TOKEN"                  │
│       -X POST localhost:9850/api/cross-post              │
│         │                                                 │
│         ▼                                                 │
│  ┌──────────────────────────────────────┐                │
│  │  Embedded HTTP Server (loopback)      │                │
│  │  • tokio + axum (Rust)               │                │
│  │  • Binds to 127.0.0.1:9850 only      │                │
│  │  • Token auth middleware              │                │
│  │  • JSON request/response              │                │
│  └──────────────┬───────────────────────┘                │
│                 │                                         │
│                 ▼                                         │
│  ┌──────────────────────────────────────┐                │
│  │  Same logic as visual UI features    │                │
│  │  • Cross-post engine                 │                │
│  │  • Schedule engine                   │                │
│  │  • Draft engine                      │                │
│  │  • Folder engine                     │                │
│  └──────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────┘
```

## Security

```
• Binds to 127.0.0.1 only (never 0.0.0.0)
• Token-based auth (generated in Settings)
• Token stored encrypted in SQLite
• User enables/disables API in Settings
• API disabled by default
• Rate limited: 60 req/min
• No CORS (loopback only, no browser origin needed)
```

## API Endpoints

### Cross-Posting

```
POST /api/cross-post
Content-Type: application/json
Authorization: Bearer {token}

{
  "master": {
    "title": "Our new API is live",
    "body": "After 6 months...",
    "type": "text"
  },
  "subreddits": [
    {
      "subreddit": "reactjs",
      "title": "Adjusted title for r/reactjs",
      "body": "Tweaked body...",
      "flair": "Show & Tell",
      "nsfw": false,
      "spoiler": false,
      "tags": ["react", "api"],
      "schedule_at": null       // null = post now
    },
    {
      "subreddit": "webdev",
      "schedule_at": "2026-06-15T09:00:00Z"  // scheduled
    }
  ]
}

Response 200:
{
  "batch_id": "uuid",
  "results": [
    {
      "subreddit": "reactjs",
      "status": "posted",
      "post_url": "https://reddit.com/r/reactjs/comments/abc123/"
    },
    {
      "subreddit": "webdev",
      "status": "scheduled",
      "scheduled_for": "2026-06-15T09:00:00Z"
    }
  ]
}
```

### Drafts

```
POST /api/drafts
Content-Type: application/json
Authorization: Bearer {token}

{ "draft": { ... same structure as cross-post payload ... } }

Response 200:
{ "draft_id": "uuid", "status": "saved" }


GET /api/drafts
Authorization: Bearer {token}

Response 200:
{
  "drafts": [
    {
      "id": "uuid",
      "master": { "title": "...", "body": "..." },
      "created_at": "2026-06-13T10:00:00Z",
      "updated_at": "2026-06-13T10:30:00Z",
      "subreddits": ["reactjs", "webdev"]
    }
  ]
}


GET /api/drafts/{id}
PUT /api/drafts/{id}
DELETE /api/drafts/{id}
```

### Schedule

```
GET /api/schedule
Authorization: Bearer {token}

Response 200:
{
  "scheduled": [
    {
      "id": "uuid",
      "subreddit": "webdev",
      "title": "Adjusted title...",
      "schedule_at": "2026-06-15T09:00:00Z",
      "status": "pending"
    }
  ]
}

DELETE /api/schedule/{id}
```

### Saved Folders

```
GET /api/folders
Authorization: Bearer {token}

Response 200:
{
  "folders": [
    { "id": "uuid", "name": "Growth Ideas", "post_count": 12 },
    { "id": "uuid", "name": "Technical Deep Dives", "post_count": 8 }
  ]
}

POST /api/folders
Content-Type: application/json
Authorization: Bearer {token}

{ "name": "New Folder Name", "description": "Optional description" }

Response 200: { "folder_id": "uuid" }


GET /api/folders/{id}/posts
DELETE /api/folders/{id}
PUT /api/folders/{id}     // rename/update
POST /api/folders/{id}/posts  // add post to folder
DELETE /api/folders/{id}/posts/{post_id}  // remove post
GET /api/folders/{id}/export      // export links (txt/csv)
```

### Subreddits & Posts

```
GET /api/subreddits
GET /api/posts?subreddit=reactjs&limit=20&offset=0
GET /api/posts/worth-responding?limit=20
```

## Settings UI

```
┌──────────────────────────────────────────────────────────────┐
│  ⚙️ Settings → API                                           │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  API Server                                                  │
│  [ ] Enable local API server                                 │
│                                                              │
│  Port:     ┌──────────┐                                     │
│           │  9850     │  (default: 9850)                    │
│           └──────────┘                                     │
│                                                              │
│  Token:    ┌────────────────────────────────────────────┐   │
│           │  klj-f8a3-9d2k-...                          │   │
│           │  [Regenerate]  [Copy]                       │   │
│           └────────────────────────────────────────────┘   │
│                                                              │
│  Status: ● Running on http://127.0.0.1:9850                 │
│                                                              │
│  Quick Test:                                                │
│  curl -H "Authorization: Bearer {token}"                    │
│       http://127.0.0.1:9850/api/subreddits                  │
└──────────────────────────────────────────────────────────────┘
```

## Nuances & Edge Cases
- **Loopback only**: Never bind to 0.0.0.0 — this is a personal desktop app
- **Port conflict**: Detect if port is in use, offer alternative
- **Token generation**: Random 32-char hex string, generated on first enable
- **No SSL**: Local-only, HTTP is fine
- **Rate limiting**: Token bucket, 60 req/min, 429 on excess
- **Logging**: Log all API requests to app logs (local only)
- **Startup**: API server starts/stops with Tauri app (not a separate process)
- **Error format**: `{ "error": "message", "code": "error_code" }` consistently
