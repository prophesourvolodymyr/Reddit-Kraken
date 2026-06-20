# Phase 1 of F01 — Fix Token Login & Auto-Connect

## Context
Token paste works but login doesn't trigger post fetching. App needs to auto-connect on startup from stored encrypted credentials. Session refresh needs verification.

## What You Need to Read First
- `features/F01-authentication/DOCKS.md` — full auth architecture
- `features/F01-authentication/F01-A-token-input/DOCKS.md` — form states
- `features/F01-authentication/F01-B-persistence/DOCKS.md` — auto-restore flow
- `features/F01-authentication/F01-C-session-refresh/DOCKS.md` — refresh flow
- `src-tauri/src/lib.rs:1070-1115` — configure_manual_token
- `src-tauri/src/lib.rs:1370-1430` — startup restore hook
- `src-tauri/src/reddit_api.rs:88-98` — new_with_token
- `src-tauri/src/reddit_api.rs:226-243` — get_valid_token

## Codebase Learnings
- `RedditClient::new_with_token(token_v2)` — creates client, sets expires_at to now + 23h
- `configure_manual_token()` — encrypts + stores token_v2 + session_cookie in auth table
- `get_valid_token()` — for ManualToken: returns stored token as-is (no refresh check)
- `disconnect_reddit()` — clears auth + subreddits + posts
- `state.rt_handle.spawn()` — used for scheduler, requires active tokio runtime
- `SettingsPanel.tsx` — Reddit Account tab with Token/Password/OAuth toggle

## What to Build
- Task 1: Verify `configure_manual_token` encrypts and stores token correctly
- Task 2: Verify startup auto-restore loads token, pings Reddit, reconnects
- Task 3: Fix post fetching trigger — after login, clicking subreddit should fetch posts
- Task 4: Verify `disconnect_reddit` clears everything properly
- Task 5: Verify session refresh flow (paste both cookies, restart, token auto-refreshes)

## Files to Modify
- modify: `src-tauri/src/lib.rs:1070-1115` — configure_manual_token (if storage broken)
- modify: `src-tauri/src/lib.rs:1370-1430` — startup restore (if reconnect broken)
- modify: `src/components/SettingsPanel.tsx` — login flow (if needed)
- modify: `src/App.tsx` — post-refresh after settings close (if needed)

## Verification
- [ ] Paste token_v2 → login → "Connected as u/xxx"
- [ ] Login → click subreddit → posts appear within 2s
- [ ] Restart app (cmd+Q, reopen) → auto-connected, no re-paste
- [ ] Logout → sidebar empty, all data cleared
- [ ] Paste token_v2 + reddit_session → login
- [ ] Token expired scenario → app handles gracefully (error or auto-refresh)

## When You Finish
Report which tasks passed, which failed, and the terminal output from `[startup]`, `[get_posts]`, and `[auth]` lines.
