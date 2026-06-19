# F01 — Authentication

Three auth modes: Manual Token (paste token_v2 from browser), Session Login (username+password → reddit_session cookie), OAuth (client_id+secret password grant). Credentials encrypted with AES-256-GCM in SQLite. Auto-restore on startup.

## What We Build

- Manual token_v2 paste with optional reddit_session for auto-refresh
- Session-based login via Reddit's `/api/login` endpoint
- OAuth password grant flow (requires Reddit Script app credentials)
- Encrypted credential storage in SQLite `auth` table
- Auto-restore on app startup: decrypt stored token, ping Reddit, reconnect
- Token auto-refresh: use reddit_session cookie to mint fresh token_v2 every ~23h

## Architecture

```
SettingsPanel (React)
│  Tab: Reddit Account
│  Toggle: Token | Password | OAuth
│  └─ Token fields: token_v2 + reddit_session
│  └─ Password fields: username + password
│  └─ OAuth fields: client_id + client_secret + username + password
│
├── configure_manual_token(token_v2, username, session_cookie?)
├── configure_reddit_session(username, password)
├── configure_reddit_auth(client_id, client_secret, username, password)
│
▼
RedditClient::new_with_token / new_with_session / new
│  authenticate() → ping()
│  set_session_cookie() → stored for auto-refresh
│
▼
encrypt_api_key() → db.set_auth() → SQLite auth table
│
▼
AppState.reddit_client = Some(Arc<RedditClient>)
start_scheduler_inner()
│
▼
On restart: run() setup hook
│  db.get_auth("reddit_token_v2") → decrypt → new_with_token → ping()
│  If expired: db.get_auth("reddit_session_cookie") → refresh_via_session()
│  If all fails: clear auth + subreddits + posts
```

## States

| State | UI | Behavior |
|-------|-----|----------|
| Disconnected | Red dot, login form visible | No client in AppState |
| Connecting | Spinner on Login button | Authenticating with Reddit |
| Connected | Green dot, "Connected as u/{name}" | Client active, scheduler running |
| Expired | Warning icon | Token expired, attempting refresh |

## Files

- `src-tauri/src/reddit_api.rs` — `AuthMode` enum, `RedditClient` constructors, `authenticate()`, `ping()`, `refresh_via_session()`, `set_session_cookie()`
- `src-tauri/src/lib.rs:1070-1110` — `configure_manual_token`, `configure_reddit_session`, `configure_reddit_auth`, `connect_reddit`, `disconnect_reddit`, `get_reddit_status`
- `src-tauri/src/lib.rs:1357-1430` — startup auto-restore in `setup()` closure
- `src-tauri/src/lib.rs:470-508` — `encrypt_api_key` / `decrypt_api_key`
- `src-tauri/src/db.rs:109-124` — `set_auth` / `get_auth`
- `src-tauri/src/models.rs:33-39` — `RedditStatus`
- `src/components/SettingsPanel.tsx` — Reddit Account tab with auth mode toggle
- `src/types.ts:128` — `RedditStatus` type

## Dependencies

- None (F01 is the foundation)

## Verification

- [ ] Paste token_v2 → Login → "Connected as u/xxx" shown
- [ ] Paste token_v2 + reddit_session → Login → auto-refresh scheduled
- [ ] Restart app → auto-reconnects without re-pasting
- [ ] Logout → clears auth, subreddits, posts
- [ ] Invalid token → clear error, not crash
- [ ] Expired token + session cookie → auto-refreshes
- [ ] Expired token + no session → clears auth gracefully
- [ ] Credentials encrypted in SQLite (not plaintext)
