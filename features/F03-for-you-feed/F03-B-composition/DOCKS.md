# F03-B — Feed Composition

Take scored posts and compose the final feed: sort, deduplicate, enforce per-subreddit limits, group by date, paginate. This is what PostList renders in "For You" mode.

## Architecture (To Build)

```
compose_feed(scored_posts) → Vec<DigestGroup>
│
│  1. Sort by final_score DESC
│  2. Dedup: max 5 posts per subreddit
│  3. Take top 100
│  4. Group by date_label (Today/Yesterday/Mon DD)
│  5. Within each date group, group by subreddit
│  6. Return as DigestGroup[]
│
get_for_you_feed(limit=50) → Vec<DigestGroup>
│  └── fetch_posts (DB) → score_posts → compose_feed
```

## Files

- `src-tauri/src/feed.rs` (new) — `compose_feed()`
- `src-tauri/src/lib.rs` — `get_for_you_feed` command (replaces `get_digested_posts`)

## Verification

- [ ] Feed sorted by score (best first)
- [ ] Max 5 posts from any single subreddit
- [ ] Groups show correct date labels
- [ ] Pagination works (offset 0 → 50 → 100)
