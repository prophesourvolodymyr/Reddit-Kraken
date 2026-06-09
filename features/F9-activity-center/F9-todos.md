# F9 TODOs

## Data Layer
- [ ] Create `activities` table in SQLite
- [ ] Implement activity dedup by source ID
- [ ] Auto-archive activities older than 7 days

## Polling & Detection
- [ ] Poll `/message/inbox` for replies to your comments
- [ ] Poll `/message/inbox` for comments on your posts
- [ ] Poll `/message/inbox` for PMs and mod messages
- [ ] Identify activity type (reply vs comment vs PM vs mod_msg)
- [ ] Detect username mentions via comment search
- [ ] Fetch context URL for each activity
- [ ] Schedule poll every 5 minutes

## AI Triage
- [ ] Build triage prompt: evaluate value per sub prompt + profile
- [ ] Classify as high_value / low_value / spam
- [ ] For high_value: generate draft reply using sub prompt's tone
- [ ] For low_value: mark as dismissed, collapsed in UI
- [ ] Store reasoning + draft on activity record

## UI — Activity Center Panel
- [ ] Bell icon button next to settings gear
- [ ] Unread count badge on bell icon
- [ ] Panel dropdown on click
- [ ] High Value section — expanded cards with draft
- [ ] Low Value section — collapsed, expandable
- [ ] History section — past acted activities
- [ ] Mark all read button
- [ ] Desktop notification for new high-value items

## Quick Reply
- [ ] [Decline] button → dismiss activity
- [ ] [Edit & Send ➔] → opens inline quick composer
- [ ] Quick composer with AI draft pre-loaded
- [ ] Edit draft, then send
- [ ] POST /api/comment or /api/compose on send
- [ ] Update activity status to "acted" after sending

## Rust Modules
- [ ] `activity.rs` — polling, detection, storage
- [ ] Integrate with F2 analysis for AI triage
- [ ] Integrate with F4 composer for quick reply
