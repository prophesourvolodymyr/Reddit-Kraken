# F05-E — Posting

Sequential posting — one subreddit at a time. Progress indicator showing per-sub status. Error handling for rate limits, bans, API failures. Retry option for failed posts.

## Posting Flow

```
User clicks [Post All Now]
│
├── Confirmation dialog: "Post to N subreddits?"
│   └── List each sub with schedule time
│
├── Sequential posting (one sub at a time):
│   for each sub in batch:
│       POST /api/submit with sub-specific title/body/flair/attachments
│       ✓ r/reactjs: Posted → link
│       ✓ r/webdev: Posted → link
│       ✗ r/startups: Rate limited → retry in 10 min
│
└── Results: All N posted successfully (or N posted, M failed)
    └── [View Posts] [Retry Failed] [Done]
```

## Error Handling

| Error | Response |
|-------|----------|
| Rate limit (429) | Wait + retry |
| Sub banned (403) | Mark sub as "restricted", skip |
| Network error | Retry 3x, then skip |
| API down (503) | Retry with backoff |

## Files

- Create: `src-tauri/src/posting.rs` — posting orchestrator
- Create: `src/components/PostProgress.tsx` — progress indicator
- Modify: `src-tauri/src/lib.rs` — `submit_cross_post_batch` command
- Modify: `src-tauri/src/reddit_api.rs` — `submit_post()` method

## Verification

- [ ] Sequential posting with per-sub progress
- [ ] Rate limit → graceful wait + retry
- [ ] Failed post → marked, can retry
- [ ] Success → links to posted content
- [ ] All posts remain as draft until explicitly posted
