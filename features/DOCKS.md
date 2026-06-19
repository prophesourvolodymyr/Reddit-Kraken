# Reddit-Kraken — Feature Index

Desktop client for productive Reddit engagement. Fetch posts, AI-grade them, respond with AI assistance, cross-post to multiple communities.

## Features

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| F01 | Authentication | `in_progress` | Manual token, session login, OAuth, token persistence + auto-refresh |
| F02 | Reddit Data Pipeline | `in_progress` | Posts, comments, subreddit metadata, content submission, notifications |
| F03 | For You Feed | `pending` | Algorithmic feed: engagement scoring + cross-sub composition |
| F04 | AI System | `pending` | LLM provider management, post evaluation, reply generation, text enhance |
| F05 | Cross-Posting | `pending` | Master editor, per-sub panels, AI adapt, scheduling, drafts, sequential posting |
| F06 | UI Shell | `in_progress` | Sidebar, post views, color accents, tab navigation |
| F07 | Filter & Search | `pending` | Post filtering, subreddit search |
| F08 | Activity Center | `pending` | Inbox, crash recovery, analytics |
| F09 | Saved Folders | `pending` | Folder management, content organization |
| F10 | Local API | `pending` | HTTP server, scripting automation |

## Build Order

```
F01 → F02 → F03 → F04 → F05
                      ↘
              F06 → F07 → F08 → F09 → F10
```

F01–F05 are sequential. F06–F10 can be built in parallel after F05.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│ React Frontend (Tauri WebView)                           │
│  Sidebar │ TopBar │ PostList │ PostDetail │ Settings     │
│  App.tsx — state hub, command dispatch                   │
├──────────────────────────────────────────────────────────┤
│ Tauri IPC Bridge (invoke ↔ #[tauri::command])            │
├──────────────────────────────────────────────────────────┤
│ Rust Backend                                             │
│  lib.rs     — 22 commands, AppState, encryption           │
│  db.rs      — SQLite (7 tables)                           │
│  reddit_api.rs — Reddit HTTP client (blocking reqwest)    │
│  scheduler.rs — 15-min poll loop per subreddit            │
│  models.rs  — all domain structs                          │
│  error.rs   — AppError enum                               │
│  llm/       — LlmProvider trait + OpenAI impl             │
└──────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Desktop | Tauri 2 |
| Backend | Rust |
| Frontend | React + TypeScript |
| Styling | Tailwind + motion/react |
| DB | SQLite (rusqlite, bundled) |
| HTTP | reqwest (blocking client, native-tls) |
| Auth | Manual token_v2, session cookie, OAuth password grant |
| Crypto | AES-256-GCM for credential encryption |
| Runtime | Tokio (multi-thread) |

## Current State (Jun 2026)

- F01: Token paste works, manual + OAuth auth modes built. Session login blocked by Reddit. Token persistence + auto-refresh built, unverified.
- F02: Post/comment fetching works, thumbnails captured. Posting/notifications not built. Icon color extraction missing.
- F03: Not started.
- F04: Provider CRUD built. Evaluation/compose/enhance not wired.
- F05: Not started. Original F4-docs.md has full UX spec.
- F06: Sidebar, post views, tabs built. Color system not built. Tabs mislabeled (General/For You reversed).
