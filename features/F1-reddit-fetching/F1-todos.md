# F1 TODOs

## Auth
- [x] Register Reddit Script app
- [x] Implement password grant auth in Rust
- [x] Store tokens in SQLite `auth` table
- [x] Auto-refresh token on expiry
- [x] Test with real Reddit API

## SQLite Schema
- [x] Create `subreddits` table
- [x] Create `posts` table
- [x] Create `comments` table
- [x] Create `auth` table
- [x] Migration system for schema updates

## Scheduler
- [x] Implement tokio cron timer
- [x] Poll each enabled sub every N minutes
- [x] Configurable interval per sub
- [x] Dedup posts by post_id
- [x] Store posts with status: "new"

## Rate Limiting
- [x] Track request count per window
- [x] Exponential backoff on 429
- [x] Queue/retry failed requests

## Rust Modules
- [x] `reddit_api.rs` — HTTP client, auth, endpoints
- [x] `db.rs` — SQLite operations
- [x] `scheduler.rs` — polling loop
- [x] `models.rs` — structs for posts, subs, comments
- [x] `lib.rs` — pub interface for Tauri commands
