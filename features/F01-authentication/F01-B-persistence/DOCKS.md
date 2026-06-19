# F01-B — Token Persistence

Credentials survive app rebuilds and restarts. Encrypted with AES-256-GCM and stored in SQLite `auth` table. Auto-restored on startup. Cleared on explicit logout or expired token with no refresh capability.

## Architecture

```
Login → encrypt_api_key(credential) → db.set_auth(key, encrypted)
│
Restart → run() setup hook
│  db.get_auth("reddit_token_v2") → decrypt → new_with_token → ping()
│  ✓ Success → client active, scheduler starts
│  ✗ Failure → try session refresh → on fail: clear all auth + data
│
Disconnect → DELETE FROM auth; DELETE FROM subreddits; DELETE FROM posts;
```

## Stored Keys

| Key | Value |
|-----|-------|
| `reddit_auth_mode` | "oauth" / "session" / "manual" |
| `reddit_token_v2` | Encrypted token_v2 JWT |
| `reddit_session_cookie` | Encrypted reddit_session cookie (optional) |
| `reddit_username` | Encrypted Reddit username |
| `reddit_password` | Encrypted Reddit password |
| `reddit_client_id` | Encrypted OAuth client_id |
| `reddit_client_secret` | Encrypted OAuth client_secret |

## Files

- `src-tauri/src/lib.rs:470-508` — `encrypt_api_key`, `decrypt_api_key` (AES-256-GCM)
- `src-tauri/src/db.rs:109-124` — `set_auth`, `get_auth`
- `src-tauri/src/lib.rs:1357-1430` — startup auto-restore logic
- `src-tauri/src/lib.rs:1210-1220` — `disconnect_reddit` clear logic

## Verification

- [ ] After login, close app, reopen → auto-connected without re-pasting
- [ ] After `cargo build`, reopen → auto-connected
- [ ] After logout → auth table empty, sidebar empty
- [ ] After expired token + no session → auth cleared, clean state
- [ ] Credentials not stored as plaintext in SQLite
