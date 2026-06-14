# CYCLES.md

## Dependency Graph
```
Phase 1 (Foundation) ──→ Phase 2 (Core Engine) ──→ Phase 3 (Discovery) ──→ Phase 4 (API & Polish)
F1 + F3 + F8               F4 + F2 + F10            F6 + F7 + F9           F11 + polish
```

---

## Phase 1 — Foundation ⬜ CURRENT
**Features:** F1 (Reddit Fetching), F3 (UI Interface), F8 (LLM Providers)

| # | Task | Status |
|---|------|--------|
| 1 | Rust: Cargo project structure, modules scaffold | ⬜ |
| 2 | Rust: SQLite schema (subreddits, posts, comments, auth) | ⬜ |
| 3 | Rust: Reddit OAuth password grant auth + token refresh | ⬜ |
| 4 | Rust: Polling scheduler (tokio cron) — fetch posts per sub | ⬜ |
| 5 | Rust: Dedup + store posts/comments in SQLite | ⬜ |
| 6 | Rust: Rate limiting + exponential backoff | ⬜ |
| 7 | Rust: Archiving hooks — save state on quit, prompt discard | ⬜ |
| 8 | React: UI shell — Sidebar, TopBar, PostList, PostDetail | ⬜ |
| 9 | React: FAB + NewPostModal + SettingsPanel | ⬜ |
| 10 | React: For You dual-mode (Digested / Normal) | ⬜ |
| 11 | React: Drag-and-drop sidebar with folder grouping | ⬜ |
| 12 | React: AI badge ("Worth responding") on post cards | ⬜ |
| 13 | Rust: LlmProvider trait (evaluate_post, suggest_reply, enhance) | ⬜ |
| 14 | Rust: OpenAI provider implementation | ⬜ |
| 15 | React: Settings UI for LLM provider config | ⬜ |
| 16 | API key encryption at rest in SQLite | ⬜ |

---

## Phase 2 — Core Engine ⬜
**Features:** F4 (Cross-Posting), F2 (AI Engagement), F10 (Saved Folders)

| # | Task | Status |
|---|------|--------|
| 1 | React: Cross-posting editor — multi-sub grid layout | ⬜ |
| 2 | React: Per-community adjustments panel (flairs, attachments, text tweaks) | ⬜ |
| 3 | React: Scheduled posting UI (now / later / custom time) | ⬜ |
| 4 | React: Batch-as-draft saving + auto-archive on quit | ⬜ |
| 5 | Rust: POST /api/submit for cross-post (one sub at a time, sequential) | ⬜ |
| 6 | Rust: Draft persistence — cross-post batches in SQLite | ⬜ |
| 7 | Rust: Schedule engine (store + execute delayed posts) | ⬜ |
| 8 | React: Post scheduling queue view | ⬜ |
| 9 | Rust: AI evaluation — binary "worth responding" per post | ⬜ |
| 10 | Rust: App memory — track seen posts, skip re-evaluation | ⬜ |
| 11 | React: Engagement queue — scrollable "Worth responding" list | ⬜ |
| 12 | React: Daily digest — per-channel, per-day categorization UI | ⬜ |
| 13 | React: Folder CRUD — create/rename/delete saved folders | ⬜ |
| 14 | React: Save post to folder action + folder picker | ⬜ |
| 15 | React: Batch export links from folder (copy/download) | ⬜ |
| 16 | Rust: Saved folders + folder items tables in SQLite | ⬜ |

---

## Phase 3 — Discovery & Management ⬜
**Features:** F6 (Filter/Search), F7 (Private Messages), F9 (Activity Center)

| # | Task | Status |
|---|------|--------|
| 1 | Rust: FTS5 virtual table for posts | ⬜ |
| 2 | Rust: Search query + combined filter logic | ⬜ |
| 3 | React: Filter bar — sub, date, score, status dropdowns | ⬜ |
| 4 | React: Search results with debounce + pagination | ⬜ |
| 5 | React: Batch export from search results | ⬜ |
| 6 | Rust: PM fetch — inbox, unread, sent via Reddit API | ⬜ |
| 7 | Rust: PM compose + send + delete | ⬜ |
| 8 | React: Inbox view — tabs, message detail, compose modal | ⬜ |
| 9 | React: PM AI suggestion button (manual, no auto-respond) | ⬜ |
| 10 | Rust: Activity polling — replies, comments on posts, PMs, mentions | ⬜ |
| 11 | React: Activity Center panel — bell icon, dropdown, activity cards | ⬜ |
| 12 | React: Activity quick reply (manual AI draft, user controls send) | ⬜ |
| 13 | React: Activity history view | ⬜ |

---

## Phase 4 — API & Polish ⬜
**Features:** F11 (Custom API)

| # | Task | Status |
|---|------|--------|
| 1 | Rust: Local HTTP server (embedded, loopback-only) | ⬜ |
| 2 | Rust: API auth (token-based, local-only) | ⬜ |
| 3 | Rust: POST /api/cross-post endpoint | ⬜ |
| 4 | Rust: GET /api/drafts + POST /api/schedule endpoints | ⬜ |
| 5 | Rust: GET /api/posts + GET /api/folders endpoints | ⬜ |
| 6 | React: API settings UI — enable/disable, token management | ⬜ |
| 7 | Desktop notifications for scheduled posts + activity | ⬜ |
| 8 | Keyboard shortcuts audit + polish | ⬜ |
| 9 | Empty states, error states, loading skeletons audit | ⬜ |

---

## Progress
Phase 1 ░░░░░░░░░░   0% (0/16)
Phase 2 ░░░░░░░░░░   0% (0/16)
Phase 3 ░░░░░░░░░░   0% (0/13)
Phase 4 ░░░░░░░░░░   0% (0/9)
