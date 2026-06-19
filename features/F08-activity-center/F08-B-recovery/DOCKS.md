# F08-B — Recovery

Crash detection and state restoration. On startup after unclean exit: recover drafts, restore active subreddit, show recovery toast. App state persisted in SQLite `app_state` table.

## What's Built

- `get_recovery_state` command — reads `exit_status`, `draft_count`, `last_active_sub`
- `set_app_state` command — writes key-value pairs
- `RecoveryInfo` struct in models.rs
- Startup writes `exit_status=running` in setup hook
- On disconnect/crash: exit_status remains as last known state

## What's Missing

- Crash detection (check if `exit_status != 'clean'` on next startup)
- Recovery UI toast
- Draft recovery automatically
- Reopen last active subreddit

## Files

- `src-tauri/src/lib.rs:457-481` — `get_recovery_state`, `set_app_state`
- `src-tauri/src/models.rs:107-111` — `RecoveryInfo`

## Verification

- [ ] Clean exit: exit_status updated to 'clean'
- [ ] Crash/force quit: on restart, recovery toast shown
- [ ] Drafts recovered from SQLite
- [ ] Last active subreddit restored
