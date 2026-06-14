# F1 TODOs

## Auth
- [ ] Register Reddit Script app
- [ ] Implement password grant auth in Rust
- [ ] Store tokens in SQLite `auth` table
- [ ] Auto-refresh token on expiry
- [ ] Test with real Reddit API

## SQLite Schema
- [ ] Create `subreddits` table
- [ ] Create `posts` table (with `seen`, `saved`, `worth_responding`, `ai_reason`, `archived`)
- [ ] Create `comments` table
- [ ] Create `auth` table
- [ ] Create `app_state` table (archiving + recovery)
- [ ] Migration system for schema updates

## Scheduler
- [ ] Implement tokio cron timer
- [ ] Poll each enabled sub every N minutes
- [ ] Configurable interval per sub
- [ ] Dedup posts by post_id
- [ ] Store posts with defaults

## Rate Limiting
- [ ] Track request count per window
- [ ] Exponential backoff on 429
- [ ] Queue/retry failed requests

## Archiving & Recovery
- [ ] Graceful close: prompt to save drafts before exit
- [ ] Auto-archive posts older than 14 days
- [ ] Persist app state on close (active sub, scroll, window)
- [ ] Unclean exit detection (sentinel or SQLite flag)
- [ ] Auto-recover drafts on next launch
- [ ] Recovery toast notification

## Rust Modules
- [ ] `reddit_api.rs` — HTTP client, auth, endpoints
- [ ] `db.rs` — SQLite operations
- [ ] `scheduler.rs` — polling loop
- [ ] `models.rs` — structs for posts, subs, comments
- [ ] `lib.rs` — pub interface for Tauri commands
