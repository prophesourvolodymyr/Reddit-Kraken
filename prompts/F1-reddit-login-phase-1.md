# Phase 1 of F1-Reddit-Login — Reddit Auth & Live Data

## Context
The app currently uses hardcoded demo posts and subreddits. The Rust backend has all OAuth code ready (`reddit_api.rs` — password grant, token refresh, rate limiting, fetch posts) but no UI to configure it. Wire a Reddit login form into Settings, store credentials encrypted, connect the scheduler, and make real Reddit data flow through the app. This bridges the gap between the polished UI and the real backend.

## What You Need to Read First
- `src-tauri/src/reddit_api.rs` — existing OAuth flow, token refresh, fetch_posts, fetch_subreddit_info
- `src-tauri/src/scheduler.rs` — polling loop, per-sub fetch, dedup storage
- `src-tauri/src/db.rs` — auth table, subreddits table, schema
- `src-tauri/src/lib.rs` — AppState, Tauri command pattern, encrypt/decrypt functions
- `src/components/SettingsPanel.tsx` — existing LLM + API tabs, add a Reddit tab
- `src/App.tsx` — sidebar state, subreddit handling
- `features/F1-reddit-fetching/F1-docs.md` — full OAuth flow, API endpoints, rate limiting
- `TECHSTACK.md` — runtime reference

## Codebase Learnings
- `RedditClient::new(client_id, client_secret, username, password)` — already built, needs credentials
- `RedditClient::authenticate()` — POSTs to Reddit, stores access_token + refresh_token
- `RedditClient::fetch_posts(subreddit)` — returns `Vec<Post>`, handles rate limiting
- `RedditClient::fetch_subreddit_info(subreddit)` — returns `(id, icon_url)` for proper subreddit IDs
- `Scheduler::new(db, client)` — polling loop, requires `RedditClient` in `AppState`
- `AppState.reddit_client` is `Arc<Mutex<Option<RedditClient>>>` — starts as `None`, needs to be populated
- `AppState.scheduler_handle` is `Arc<Mutex<Option<tokio::task::JoinHandle<()>>>>` — starts as `None`
- Encryption: `encrypt_api_key()` / `decrypt_api_key()` in lib.rs use AES-256-GCM
- SettingsPanel uses tabs: LLM Providers | Local API — add Reddit Account tab
- Sidebar subreddits are hardcoded placeholders — need to become real subreddits from Reddit API
- PostList falls back to demo posts when backend is empty — should show real posts once populated
- App opens on "For You" with no sub selected — stays as-is until user adds subs

## What to Build
- Task 1: Add Reddit Account tab to SettingsPanel — provider name (Reddit), client_id input, client_secret input (masked), username input, password input (masked), login button, logout button, connection status indicator
- Task 2: Rust Tauri command `configure_reddit_auth` — takes credentials, creates RedditClient, tests auth, stores encrypted in `auth` table, updates AppState
- Task 3: Rust Tauri command `connect_reddit` — creates RedditClient from stored auth, authenticates, starts scheduler
- Task 4: Rust Tauri command `disconnect_reddit` — stops scheduler, clears client from AppState
- Task 5: Rust Tauri command `get_reddit_status` — returns whether Reddit is connected, username, token expiry
- Task 6: Login flow — on successful login, auto-fetch subreddit info (id, icon_url, description, subscribers), add to subreddits table, update sidebar
- Task 7: Scheduler auto-start — when RedditClient is created and Auth is confirmed, start the polling loop in a background tokio task
- Task 8: Real subreddits replace placeholders — once Reddit is connected and subs are added, the sidebar shows real subreddit data (fetched icons, descriptions, subscriber counts)
- Task 9: Remove hardcoded demo data — once Reddit fetches real posts, demos should not show. Keep the demo fallback ONLY when Reddit is not connected.
- Task 10: Add Subreddit flow — clicking "+" in sidebar opens a search/add dialog, user types subreddit name, app calls `fetch_subreddit_info` to get real data, adds to DB and sidebar

## Files to Create/Modify
- modify: `src/components/SettingsPanel.tsx` — add Reddit Account tab with full login form
- modify: `src-tauri/src/lib.rs` — add Tauri commands: configure_reddit_auth, connect_reddit, disconnect_reddit, get_reddit_status, add_subreddit (update to use Reddit API), start_scheduler
- modify: `src-tauri/src/db.rs` — ensure auth table handles Reddit credentials (client_id, client_secret, username, password all encrypted)
- modify: `src-tauri/src/reddit_api.rs` — add `ping()` method for connection testing, add proper error handling for auth failures
- modify: `src/App.tsx` — sidebar subreddits load from backend (get_subreddits), add_subreddit via search dialog, remove hardcoded placeholders when Reddit connected
- modify: `src/components/Sidebar.tsx` — add_subreddit opens search dialog instead of no-op
- modify: `src/components/PostList.tsx` — only show demo fallback when Reddit is NOT connected (check status)
- create: `src/components/AddSubredditModal.tsx` — search dialog, type subreddit name, preview info before adding

## Verification
- [ ] `cargo check` — no errors
- [ ] `npm run build` — no errors
- [ ] Settings → Reddit Account tab shows login form
- [ ] Enter valid Reddit Script app credentials → Login button tests connection → shows "Connected as u/username"
- [ ] After login, scheduler starts polling → posts appear in app from real Reddit
- [ ] Add Subreddit via sidebar "+" → searches real Reddit → adds with icon, description, subscribers
- [ ] Sidebar shows real subreddits with proper icons and data
- [ ] PostList shows real Reddit posts (no demo data when connected)
- [ ] Logout button clears auth, stops scheduler, reverts to empty/demo state
- [ ] Credentials are encrypted in SQLite (not plaintext)
- [ ] For You / General views work with real data
- [ ] No crash on invalid credentials, network errors, or rate limits

## When You Finish
Report what was built, what was verified, and any issues found. Mark tasks in `features/F1-reddit-fetching/F1-todos.md` and `CYCLES.md`.
