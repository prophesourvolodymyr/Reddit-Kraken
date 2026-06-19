# F7 TODOs

## Message Fetching
- [ ] Poll `/message/inbox` every 5 minutes
- [ ] Store in messages table (dedup by message ID)
- [ ] Track unread count for badge
- [ ] Fetch sent messages

## Compose & Send
- [ ] POST /api/compose for new messages
- [ ] POST /api/del_msg for delete
- [ ] POST /api/read_message for mark as read
- [ ] POST /api/read_all_messages
- [ ] Draft persistence in SQLite

## UI
- [ ] InboxView with tabs (Inbox / Unread / Sent)
- [ ] MessageList component
- [ ] MessageDetail component
- [ ] Compose modal (To, Subject, Body)
- [ ] [🤖 Suggest Reply] button (manual, user-initiated)
- [ ] [🤖 Enhance] / [🤖 Fix Grammar] buttons in compose
- [ ] Unread count badge in sidebar/TopBar
- [ ] Delete message with confirmation

## Rust Modules
- [ ] `messages.rs` — fetch, send, delete, mark read
- [ ] `pm_drafts.rs` — draft storage & retrieval
