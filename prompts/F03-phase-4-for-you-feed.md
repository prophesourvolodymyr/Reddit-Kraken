# Phase 4 of F03 — For You Feed Algorithm

## Context
The For You page needs a real algorithmic feed — not just all posts sorted by date. Score posts by engagement (upvotes, comments, upvote ratio) and freshness (time decay). Mix from all subscribed subreddits. Cap per-subreddit to avoid domination.

## What You Need to Read First
- `features/F03-for-you-feed/DOCKS.md` — full feed pipeline
- `features/F03-for-you-feed/F03-A-scoring/DOCKS.md` — scoring formula
- `features/F03-for-you-feed/F03-B-composition/DOCKS.md` — feed composition
- `src-tauri/src/lib.rs:336-410` — get_digested_posts, build_digested_groups
- `src-tauri/src/models.rs:45-52` — DigestGroup struct

## Codebase Learnings
- `get_digested_posts()` currently returns all non-archived posts (no scoring)
- `build_digested_groups()` groups by date_label + subreddit (no sorting by quality)
- Post model has `score`, `num_comments`, `created_utc` — all needed for scoring
- Upvote ratio not stored — need to add field or use default 0.85

## What to Build
- Task 1: Create `src-tauri/src/feed.rs` — `score_posts()` function
- Task 2: Create `compose_feed()` — sort, dedup per-sub, limit, paginate
- Task 3: Replace `get_digested_posts` with `get_for_you_feed` command
- Task 4: Update PostList "For You" mode to call `get_for_you_feed`
- Task 5: Add upvote_ratio to Post model and capture from API

## Scoring Formula
```
engagement = score × upvote_ratio + num_comments × 3
freshness = 0.5 ^ (age_hours / 6)
final = engagement × freshness × 1000
```

## Files to Create/Modify
- create: `src-tauri/src/feed.rs` — scoring + composition
- modify: `src-tauri/src/lib.rs` — add `get_for_you_feed` command, register in handler
- modify: `src-tauri/src/models.rs` — add `upvote_ratio` to Post
- modify: `src-tauri/src/reddit_api.rs` — capture `upvote_ratio` from API
- modify: `src/components/PostList.tsx` — use `get_for_you_feed` for digested mode

## Verification
- [ ] For You feed ranks high-score, recent posts at top
- [ ] Old posts decay below fresh ones
- [ ] Max 5 posts from any single subreddit
- [ ] Feed respects pagination (load more)
- [ ] `cargo check` — no errors

## When You Finish
Report the top 5 posts from the For You feed with their scores and which subreddits they came from.
