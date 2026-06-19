# Phase 5 of F02-D — Content Submission

## Context
Wire up the post creation and commenting UI to the Reddit API. NewPostModal's Post button and PostDetail's Reply button are UI-only right now. Votes are local state only.

## What You Need to Read First
- `features/F02-reddit-data/F02-D-content-submission/DOCKS.md`
- `src/components/NewPostModal.tsx` — post creation form
- `src/components/PostDetail.tsx` — reply textarea + comment composition
- `src/components/PostCard.tsx` — vote buttons
- `src-tauri/src/reddit_api.rs` — needs submit_post(), submit_comment(), vote()

## What to Build
- Task 1: Add `submit_post()` to RedditClient (POST /api/submit)
- Task 2: Add `submit_comment()` to RedditClient (POST /api/comment)
- Task 3: Add `vote()` to RedditClient (POST /api/vote)
- Task 4: Wire NewPostModal's Post button → invoke "submit_post"
- Task 5: Wire PostDetail's Reply button → invoke "submit_comment"
- Task 6: Wire PostCard vote buttons → invoke "vote"

## Files to Create/Modify
- modify: `src-tauri/src/reddit_api.rs` — add submit_post, submit_comment, vote
- modify: `src-tauri/src/lib.rs` — add commands, register in handler
- modify: `src/components/NewPostModal.tsx` — wire Post button
- modify: `src/components/PostDetail.tsx` — wire Reply button
- modify: `src/components/PostCard.tsx` — wire vote buttons

## Verification
- [ ] Create text post → appears on Reddit
- [ ] Reply to post → comment appears on Reddit
- [ ] Upvote/downvote → reflected on Reddit
- [ ] Rate limit → graceful error message
- [ ] No crash on network error
