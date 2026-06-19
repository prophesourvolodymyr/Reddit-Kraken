# Phase 2 of F02 — Fix Post Fetching + Comment Loading

## Context
Posts should appear instantly when clicking a subreddit. Comments should load when clicking a post. Thumbnails should display. PostList should auto-refresh. Currently broken — no posts appear after login.

## What You Need to Read First
- `features/F02-reddit-data/DOCKS.md` — full data pipeline
- `features/F02-reddit-data/F02-A-post-fetching/DOCKS.md` — post fetch flow
- `features/F02-reddit-data/F02-B-comment-fetching/DOCKS.md` — comment flow
- `src-tauri/src/lib.rs:178-280` — get_posts, fetch_posts_live, get_posts_inner
- `src-tauri/src/reddit_api.rs:350-410` — fetch_posts()
- `src-tauri/src/reddit_api.rs:468-524` — fetch_comments()
- `src/components/PostList.tsx` — fetchPosts, auto-refresh interval
- `src/components/PostDetail.tsx` — comment rendering
- `src/App.tsx:218-229` — handlePostClick (fetches comments)

## Codebase Learnings
- `get_posts()` now calls `fetch_posts_live_inner()` if client is connected
- `fetch_posts_live_inner()` uses blocking reqwest → should NOT need tokio
- PostList auto-refreshes every 15s when `isRedditConnected` is true
- `eprintln!("[get_posts] CALLED sub=...")` → look for this in terminal
- If you DON'T see `[get_posts] CALLED`, the frontend isn't calling the command
- `fetch_comments()` strips `t3_` prefix from post ID
- Comments rendered as threaded tree with collapse in PostDetail

## What to Build
- Task 1: Fix `get_posts` → verify it's being called when user clicks subreddit
- Task 2: Fix live fetch → ensure Reddit API call succeeds and stores posts in DB
- Task 3: Fix PostList polling → ensure 15s auto-refresh works when connected
- Task 4: Fix thumbnails → ensure `thumbnail_url` is captured and rendered
- Task 5: Verify comment loading → click post → comments appear

## Files to Modify
- modify: `src-tauri/src/lib.rs:178-280` — get_posts debugging/logging
- modify: `src/components/PostList.tsx` — fetchPosts interval, isRedditConnected
- modify: `src/App.tsx` — isRedditConnected state initialization

## Verification
- [ ] Terminal shows `[get_posts] CALLED sub=Some("t5_...")` when clicking sub
- [ ] Terminal shows `[get_posts] Fetching r/subname from Reddit...`
- [ ] Terminal shows `[get_posts] r/subname: got 25 posts`
- [ ] Posts appear in PostList with titles, authors, scores
- [ ] Thumbnails load for image posts
- [ ] Click post → comments load with threaded nesting
- [ ] PostList auto-refreshes every 15s (visible in terminal)

## When You Finish
Report terminal output for each step. If `[get_posts] CALLED` never appears, focus on frontend invoke path. If `[get_posts]` appears but no posts returned, focus on Reddit API call.
