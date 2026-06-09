# F7 TODOs

## Message Fetching
- [ ] Implement GET /message/inbox
- [ ] Implement GET /message/unread
- [ ] Implement GET /message/sent
- [ ] Store messages in SQLite messages table
- [ ] Dedup by message_id
- [ ] Poll inbox every 5 minutes
- [ ] Track unread count for badge

## Message Actions
- [ ] Implement POST /api/compose
- [ ] Implement POST /api/del_msg
- [ ] Implement POST /api/read_message
- [ ] Mark as read when opened
- [ ] Mark all as read button

## UI
- [ ] Inbox tab with unread badge
- [ ] Inbox/Unread/Sent sub-tabs
- [ ] Message list (sender, subject, time, preview)
- [ ] Message detail view (full body)
- [ ] Compose PM modal
- [ ] AI assist in PM composer
- [ ] Delete message button
- [ ] Thread grouping by subject

## Rust Modules
- [ ] `messages.rs` — fetch, send, delete messages
- [ ] Integrate with F4 composer for AI assistance
