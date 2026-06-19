# F08-C — Analytics

Track cross-posting performance: views per post, upvote ratios, comment engagement, response rates. Dashboard showing activity over time. Karma tracking per subreddit.

## Metrics

- Posts submitted per subreddit
- Average score per subreddit
- Comment engagement rate
- Best-performing time slots
- Response rate (replies received / posts made)
- Karma growth over time

## Files

- Create: `src/components/Analytics.tsx` — dashboard
- Create: `src-tauri/src/analytics.rs` — metrics computation
- Modify: `src-tauri/src/lib.rs` — `get_analytics` command

## Verification

- [ ] Dashboard loads with real data
- [ ] Charts show time-series data
- [ ] Per-subreddit breakdown available
