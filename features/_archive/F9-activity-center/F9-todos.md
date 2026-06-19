# F9 TODOs

## Data Layer
- [ ] Create `activities` table in SQLite
- [ ] Implement activity dedup by source ID
- [ ] Auto-archive activities older than 14 days

## Polling & Detection
- [ ] Poll `/message/inbox` for replies to your comments
- [ ] Poll `/message/inbox` for comments on your posts
- [ ] Poll `/message/inbox` for PMs and mod messages
- [ ] Identify activity type (reply vs comment vs PM vs mod_msg)
- [ ] Detect username mentions via comment search
- [ ] Schedule poll every 5 minutes

## UI — Activity Center Panel
- [ ] Bell icon in top bar with unread count badge
- [ ] Panel dropdown on click
- [ ] Activity cards (type, user, text, time)
- [ ] [Reply] button → opens quick composer
- [ ] [Dismiss] button → hides activity
- [ ] [🤖 Suggest Reply] button in quick composer (manual, optional)
- [ ] History section — past acted activities
- [ ] Mark all read button
- [ ] Desktop notification for new activities

## Quick Reply
- [ ] Inline quick composer (not full post detail)
- [ ] Optional AI suggestion on demand
- [ ] Send reply via POST /api/comment or /api/compose
- [ ] Update activity status to "acted" after sending

## Rust Modules
- [ ] `activity.rs` — polling, detection, storage
