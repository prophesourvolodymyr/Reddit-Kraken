# Session Handoff — Cycle 0 Complete

## What Happened in This Session
Started from scratch with an idea → designed full architecture → created all feature docs/todos → set up repo structure → established AGENTS.md with project identity.

## Project State
- **Status**: Design Complete, zero code written
- **8 features designed**: F1 (Fetching), F2 (AI Analysis), F3 (UI), F4 (Composer), F5 (Comments), F6 (Search), F7 (PMs), F8 (LLM Providers)
- **Stack locked**: Tauri + Rust + React + shadcn/ui + SQLite + OpenAI V1 + fastembed-rs + Reddit Script app auth
- **UI**: Black & white minimalistic, Discord-like layout, Inter Bold 18px titles
- **UX**: General feed, per-sub view, filter/search, AI Respond split view, Inbox, New Post FAB with auto-detect subreddit

## Repo Structure
```
/Users/volodymurvasualkiw/Desktop/Opensource/Reddit-Kraken/
├── AGENTS.md          ← filled with project identity
├── CYCLES.md          ← 6 cycles mapped
├── TECHSTACK.md       ← full stack reference
├── ORIGINAL IDEA.md
├── README.md
├── session-ses_1eb7.md
├── genesis/           ← audit notes (this file goes here)
└── features/
    ├── F1-reddit-fetching/   → F1-docs.md + F1-todos.md
    ├── F2-ai-analysis/       → F2-docs.md + F2-todos.md
    ├── F3-ui-interface/      → F3-docs.md + F3-todos.md
    ├── F4-ai-composer/       → F4-docs.md + F4-todos.md
    ├── F5-comment-analysis/  → F5-docs.md + F5-todos.md
    ├── F6-filter-search/     → F6-docs.md + F6-todos.md
    ├── F7-private-messages/  → F7-docs.md + F7-todos.md
    └── F8-llm-providers/     → F8-docs.md + F8-todos.md
```

## Key Decisions Made

| Decision | Choice |
|----------|--------|
| Desktop framework | Tauri |
| Frontend | React + shadcn/ui |
| Backend | Rust |
| Database | SQLite |
| LLM V1 | OpenAI (GPT-4o-mini) |
| LLM future | Pluggable trait, 21+ providers |
| Embeddings | Local fastembed-rs (all-MiniLM-L6-v2) |
| Reddit auth | Script app, password grant |
| Polling | Every 15min, top 25 New, dedup by post_id |
| Status system | new→analyzed→reviewed→drafted→responded/dismissed/archived |
| Score | 1-10, AI sets with reasoning |
| Reply model | AI suggests/enhances/rewrites, user presses Post |
| UI style | Black & white minimal, Inter Bold 18px titles |
| Layout | Discord-like: left sub circles (70px) + 80% content |
| New Post | FAB bottom-right, auto-detect sub from sidebar |
| Private msgs | Full inbox/sent/compose/delete via Reddit API |

## Important Nuances Learned
- **AGENTS.md was empty** at repo root — filled it with project identity + FORAGENTS.md meta-guide
- **User prefers files inside features/**: `F1-docs.md` and `F1-todos.md` (not subdirectories)
- **Docs must have ASCII diagrams** — user approved this format
- **User wants multiple phases per prompt** to fill 200k context (not just one tiny step)
- **No backfill** on first fetch — start fresh, build history over time
- **Cost-aware design**: embedding pre-filter → LLM only for high-value posts
- **Human-in-the-loop** for ALL posting (AI assists, user approves)
- **genesis/** folder for audit notes and session handoffs

## What's Next — Cycle 1

The next AI should:
1. Read `AGENTS.md` first
2. Read `CYCLES.md` — Cycle 1 = F1 + F3
3. Read `features/F1-reddit-fetching/F1-docs.md` then `F1-todos.md`
4. Read `features/F3-ui-interface/F3-docs.md` then `F3-todos.md`
5. Start building:

### Phase: Cycle 1 — Foundation
**Features:** F1 Reddit Fetching + F3 UI Scaffold

Priority order:
1. Tauri + React project init (npm create tauri-app)
2. SQLite schema in Rust (rusqlite)
3. Reddit auth module (OAuth password grant)
4. Reddit API client (fetch posts)
5. Background scheduler (tokio cron)
6. shadcn/ui install + theme setup
7. Sidebar component with sub circles
8. TabBar + General view (PostList)

### Build instructions:
- Rust backend modules under `src-tauri/src/`
- React frontend under `src/`
- Use `cargo tauri dev` to test live
- Run `cargo tauri build` before marking anything done
- Mark `[x]` in CYCLES.md and F1-todos.md / F3-todos.md as tasks complete
- Update F1-docs.md and F3-docs.md with implementation details as you go
- Do NOT ask the user open-ended questions — take a position and propose

## User Communication Style
- Concise, direct
- Corrects mistakes fast ("wait", "no")
- Likes confirmation of understanding before proceeding
- Wants visuals/diagrams in documentation
- Prefers action over deliberation — "just do it" after direction is clear
- Uses phonetic/abbreviated spelling ("docks" for "docs", "na" for "and", "whetre" for "where")
