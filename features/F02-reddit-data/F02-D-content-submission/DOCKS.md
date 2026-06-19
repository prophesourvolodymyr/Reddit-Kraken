# F02-D — Content Submission

Submit new posts and comments to Reddit. Post creation with title, body, flair, NSFW/spoiler toggles. Comment replies threaded under parent. Voting (upvote/downvote). All gated behind user action (no automated posting).

## Architecture (Not Yet Built)

```
NewPostModal → invoke("submit_post", {subreddit, title, body, ...})
│  └── RedditClient::submit_post()
│       └── POST oauth.reddit.com/api/submit
│            form: kind=self, sr={subreddit}, title, text, flair_id, nsfw, spoiler
│       └── Returns {id, url} → display success with link

PostDetail reply → invoke("submit_comment", {parent_id, text})
│  └── RedditClient::submit_comment()
│       └── POST oauth.reddit.com/api/comment
│            form: thing_id={parent_fullname}, text
│       └── Refresh comments after posting

Voting → invoke("vote", {id, direction: 1|0|-1})
│  └── RedditClient::vote()
│       └── POST oauth.reddit.com/api/vote
│            form: id={fullname}, dir={direction}
```

## API Endpoints

| Action | Endpoint | Method |
|--------|----------|--------|
| Submit post | `/api/submit` | POST |
| Submit comment | `/api/comment` | POST |
| Vote | `/api/vote` | POST |

## Current State

- NewPostModal UI exists but Post button is not wired to any backend command
- PostDetail reply textarea exists but Reply button is not wired
- PostCard vote buttons are UI-only (local state, not persisted)

## Files

- `src-tauri/src/reddit_api.rs` — needs `submit_post()`, `submit_comment()`, `vote()` methods
- `src-tauri/src/lib.rs` — needs `submit_post`, `submit_comment`, `vote` commands
- `src/components/NewPostModal.tsx` — UI exists, needs wiring
- `src/components/PostDetail.tsx` — reply UI exists, needs wiring
- `src/components/PostCard.tsx` — vote UI exists, needs wiring

## Verification

- [ ] Create text post → appears on Reddit
- [ ] Reply to post → comment appears on Reddit
- [ ] Upvote/downvote → reflected on Reddit score
- [ ] Rate limit → graceful error
- [ ] Post flair selection from subreddit's available flairs
