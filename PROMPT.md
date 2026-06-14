# PROMPT.md — Reddit Kraken: Session 2

## Context

Reddit Kraken is a Tauri desktop app for power Reddit users. Killer feature: **cross-posting** — write one post, tailor per community, post across multiple subreddits. AI plays a minimal role: flags best posts worth responding to, assists composing on demand. Built for indie makers, devs, founders.

### Current State
- **Frontend**: React + shadcn/ui shell exists with placeholder data. 11 components (Sidebar, TopBar, PostList, PostDetail, FAB, NewPostModal, SettingsPanel, etc.). They work but use hardcoded mock data, need polish.
- **Backend**: `src-tauri/src/` is EMPTY. Cargo.toml has all deps (rusqlite, tokio, reqwest, serde, chrono, aes-gcm, etc.). `tauri.conf.json` exists.
- **Phase**: Phase 1 — Foundation (0/16 tasks). We start now.

### Files to read first
- `AGENTS.md` — project purpose + conventions
- `CYCLES.md` — phase/task tracking
- `features/F1-reddit-fetching/F1-docs.md` — Reddit API, SQLite schema, scheduler
- `features/F3-ui-interface/F3-docs.md` — UI layout, component tree
- `TECHSTACK.md` — stack reference

---

## Part 1: UI Polish (Clean existing components)

The UI exists but needs refinement. Keep the same layout, same dark theme, same components. Make them production-ready.

### 1.1 Global polish
- Remove all hardcoded placeholder data (`getPlaceholderItems()` in App.tsx). Replace with empty states.
- Every component that currently shows mock data should show proper empty/loading/error states.
- Fix any TypeScript strict issues.
- Ensure `npm run build` passes clean (warnings OK, errors not).
- Add smooth transitions between views (150-200ms ease).
- Audit keyboard shortcuts: Escape closes modals, Tab between posts, Enter opens, J/K navigate.

### 1.2 Sidebar
- Current: Works with placeholder subreddits. `getPlaceholderItems()` returns hardcoded data.
- Fix: Accept `items` from props. If empty array, show "No subreddits yet" + "+" button pulse.
- The ForYouButton at top should have the kraken.svg as icon, with divider below it.
- Ensure drag-and-drop still works after removing mock data (pointer events, not HTML5 DnD).
- Settings gear at bottom — already plumbed to `setShowSettings(true)`.

### 1.3 PostList / PostCard
- Current: Shows placeholder posts sliced from mock data.
- Fix: Accept `posts: Post[]` from props. Empty = "No posts yet. Add a subreddit to get started." with SVG illustration placeholder.
- Loading = 3 skeleton cards (gray pulsing rectangles).
- Error = inline error message with retry button.
- PostCard: `✦ Worth responding` badge shown when `post.worth_responding === 1`. No score numbers.

### 1.4 For You dual-mode
- Add Toggle component at top of General view: `[Digested] [Normal]`
- Digested mode: group posts by day + subreddit (posts with `worth_responding=1`).
- Normal mode: flat chronological from all subs. Classic Reddit style with score and comment counts.
- Default to Digested on first open.

### 1.5 FAB + NewPostModal
- FAB: bottom-right, floating. Shows tooltip with current auto-detected subreddit.
- NewPostModal: add a button "Open in Cross-Post Editor" (no-op for now, just button).
- Add SubredditSelector dropdown (placeholder for now).
- Add PostTypeSelector (Text | Link | Image).
- Add Flair placeholders, NSFW/Spoiler toggles.

### 1.6 SettingsPanel
- Add LLM Provider section: provider name, API key input (masked), model selector, test connection button (no-op for now).
- Add API section: enable/disable toggle, port input, token display (regenerate), status indicator.

### 1.7 Empty states for ALL views
- FilterView: "No posts match your search" with suggestion to broaden filters.
- AIRespondView: "No posts worth responding to right now" with link to adjust interest profile.
- InboxView: "No messages" with illustration.
- PostDetail: proper loading/error states.
- Cross-post tab: "Open the cross-post editor from a post or the FAB" placeholder.

---

## Part 2: Build Phase 1 Backend (Rust)

All code under `src-tauri/src/`. Use `cargo tauri dev` to test.

### 2.1 Module structure
```
src-tauri/src/
  main.rs        — Tauri entry point
  lib.rs         — public interface, Tauri commands
  db.rs          — SQLite: schema creation, migrations, connection pool
  models.rs      — Rust structs (Subreddit, Post, Comment, Auth, AppState)
  reddit_api.rs  — HTTP client: OAuth flow, fetch posts, rate limiting
  scheduler.rs   — tokio cron: poll subreddits, dedup, store
  llm/
    mod.rs       — LlmProvider trait + Evaluation type
    openai.rs    — OpenAI provider implementation
  error.rs       — unified error types
```

### 2.2 SQLite schema (db.rs)
Implement the schema from `features/F1-reddit-fetching/F1-docs.md`:
- `subreddits` table
- `posts` table (with `seen`, `saved`, `worth_responding`, `ai_reason`, `archived` columns)
- `comments` table
- `auth` table
- `app_state` table (for archiving/recovery)
Create on first run. Handle migrations.

### 2.3 Reddit OAuth (reddit_api.rs)
- Password grant flow: POST to `https://www.reddit.com/api/v1/access_token`
- Store `access_token`, `refresh_token`, `client_id`, `client_secret` in `auth` table encrypted
- Auto-refresh when token expires (before every request, check expiry)
- API client: GET `/r/{sub}/new`, GET `/r/{sub}/about`
- Rate limiting: track requests per 60s window, exponential backoff on 429
- User-Agent header: `Reddit-Kraken/0.1.0 (by /u/{username})`

### 2.4 Scheduler (scheduler.rs)
- tokio cron: poll each enabled subreddit every N minutes (configurable, default 15)
- Dedup by `post_id` (INSERT OR IGNORE)
- Store posts with defaults
- Handle per-sub errors gracefully (one sub failing doesn't block others)

### 2.5 Tauri commands (lib.rs)
```
get_subreddits() -> Vec<Subreddit>
add_subreddit(name: String) -> Result<Subreddit>
remove_subreddit(id: String) -> Result<()>
get_posts(subreddit_id: Option<String>, limit: u32, offset: u32) -> Vec<Post>
get_post_detail(post_id: String) -> Result<PostDetail>
get_worth_responding_posts() -> Vec<Post>
get_digested_posts() -> Vec<DigestGroup>
mark_seen(post_id: String) -> Result<()>
dismiss_post(post_id: String) -> Result<()>
```

### 2.6 Archiving hooks
- On app close: check for unsaved state, persist `app_state`
- On launch: check `app_state.exit_status`, recover if unclean
- Auto-archive: posts older than 14 days get `archived=1`
- Return recovery info via Tauri command: `get_recovery_state() -> Option<RecoveryInfo>`

### 2.7 LLM trait (llm/mod.rs)
```rust
#[async_trait]
pub trait LlmProvider: Send + Sync {
    async fn evaluate_post(&self, prompt: &str) -> Result<Evaluation>;
    async fn suggest_reply(&self, prompt: &str) -> Result<String>;
    async fn enhance_text(&self, draft: &str, mode: EnhanceMode) -> Result<String>;
}
```
Implement OpenAI provider. Config stored in `provider_configs` table.

---

## Build Verification
- `cargo check` — no errors in `src-tauri/`
- `npm run build` — no errors in `src/`
- `cargo tauri dev` — app launches, UI visible
- At minimum: app shows empty sidebar with "+" button, settings panel opens, views render with empty states

---

## Task Tracking
Mark tasks complete as you finish them:
- `CYCLES.md` — update Phase 1 tasks from `⬜` → `[x]`
- `features/F1-reddit-fetching/F1-todos.md` — F1 tasks
- `features/F3-ui-interface/F3-todos.md` — F3 tasks
- `features/F8-llm-providers/F8-todos.md` — F8 tasks (LLM trait)

---

## Key Rules
- Read the relevant `DOCS.md` before coding a feature
- Never edit `ORIGINAL IDEA.md`
- Run the build command before marking anything done
- Keep the black & white minimalistic theme
- Keep Inter Bold 18px titles, Inter Regular 14px body
- Use shadcn/ui components, Lucide icons
- AI features in this session are trait + stub only (no live API keys needed)
- Take positions, don't ask open-ended questions
- Go big on the first pass, user will trim later
