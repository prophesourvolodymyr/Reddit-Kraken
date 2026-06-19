# F02-E — Notifications

Fetch Reddit inbox, unread messages, comment replies, and mentions. Display in InboxView with unread count badges. Activity feed with real-time polling.

## Architecture (Not Yet Built)

```
RedditClient::fetch_inbox()
│  └── GET oauth.reddit.com/message/inbox?limit=25
│  └── Map to Message struct (id, author, subject, body, created_utc, is_read, direction)
│
RedditClient::fetch_unread_count()
│  └── GET oauth.reddit.com/api/v1/me → data.inbox_count
│  └── Display as badge on Inbox icon in TopBar
│
Frontend: InboxView component
│  └── Tabs: Inbox / Unread / Sent
│  └── Message list with read/unread styling
│  └── Click to open message detail
│  └── Reply inline
│
Polling: every 2 minutes check unread count
│  └── Update badge in TopBar
```

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /message/inbox` | Fetch inbox messages |
| `GET /message/unread` | Fetch unread messages |
| `GET /message/sent` | Fetch sent messages |
| `POST /api/compose` | Send a private message |
| `POST /api/read_message` | Mark message as read |

## Current State

- `Message` type defined in `types.ts` (not used)
- `InboxView.tsx` has tab UI but no data fetching
- TopBar has Inbox button wired to toggle `showInbox`

## Files

- `src-tauri/src/reddit_api.rs` — needs `fetch_inbox()`, `fetch_unread_count()` methods
- `src-tauri/src/lib.rs` — needs `get_inbox`, `get_unread_count` commands
- `src/components/InboxView.tsx` — tab UI exists, needs data wiring
- `src/components/TopBar.tsx` — Inbox button with future badge slot
- `src/types.ts:67-75` — `Message` type

## Verification

- [ ] Inbox icon shows unread count badge
- [ ] Inbox view displays messages with read/unread styling
- [ ] Click message → full thread view
- [ ] Reply to message from inbox
- [ ] Polls every 2 min for new unread count
