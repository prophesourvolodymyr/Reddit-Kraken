# F08-A — Inbox

View and manage Reddit messages. Three tabs: Inbox (all), Unread (filtered), Sent. Message list with preview, click to open full message, inline reply. Mark as read/unread.

## API

| Endpoint | Purpose |
|----------|---------|
| `GET /message/inbox` | All messages |
| `GET /message/unread` | Unread only |
| `GET /message/sent` | Sent messages |
| `POST /api/compose` | Send message |
| `POST /api/read_message` | Mark read |

## Files

- `src/components/InboxView.tsx` — tab UI (stub)
- `src-tauri/src/reddit_api.rs` — `fetch_inbox()`, `fetch_unread_count()` (to add)
- `src/types.ts:67-75` — `Message` type

## Verification

- [ ] Inbox shows messages with read/unread styling
- [ ] Click message → full view
- [ ] Reply inline from inbox
- [ ] Unread count badge updates
