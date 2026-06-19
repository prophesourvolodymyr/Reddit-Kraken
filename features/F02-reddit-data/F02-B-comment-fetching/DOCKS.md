# F02-B — Comment Fetching

When user opens a post detail, fetch comment thread from Reddit API. Comments returned with threading (parent_id links), author, body, score, and timestamps. Rendered as collapsible nested tree in PostDetail.

## Architecture

```
Frontend: App.handlePostClick → invoke("get_post_detail", {postId})
│
Backend: get_post_detail(post_id)
│  └── RedditClient::fetch_comments(post_id)
│       └── Strip "t3_" prefix → article ID
│       └── GET oauth.reddit.com/comments/{article}.json?limit=50&depth=2
│       └── Response: [post_listing, comment_listing]
│       └── Extract comments from second listing element
│       └── Filter: skip [deleted] (no author)
│       └── Map to Comment struct with "t1_" ID prefix
│
Frontend: PostDetail receives comments: Comment[]
│  └── buildCommentTree(comments) → nested CommentNode[]
│  └── Recursive CommentItem component with collapse
```

## API Endpoint

```
GET https://oauth.reddit.com/comments/{article}.json?limit=50&depth=2
Authorization: Bearer {token_v2}
```

## Response Mapping

| API Field | Comment Field |
|-----------|--------------|
| `data.children[].data.id` | `id` (prefixed `t1_`) |
| `data.children[].data.parent_id` | `parent_id` |
| `data.children[].data.author` | `author` |
| `data.children[].data.body` | `body` |
| `data.children[].data.score` | `score` |
| `data.children[].data.created_utc` | `created_utc` |

## Files

- `src-tauri/src/reddit_api.rs:468-524` — `fetch_comments()`
- `src-tauri/src/lib.rs:378-415` — `get_post_detail()`
- `src-tauri/src/models.rs:63-66` — `PostDetail` struct (post + vec<Comment>)
- `src-tauri/src/models.rs:75-85` — `Comment` struct
- `src/components/PostDetail.tsx` — comment tree rendering, collapsing
- `src/App.tsx:218-229` — `handlePostClick` fetches comments

## Verification

- [ ] Click post → comments load within 2 seconds
- [ ] Nested replies show indented with color lines
- [ ] Comment collapse/expand works
- [ ] Scores and timestamps display correctly
- [ ] Deleted comments filtered out
- [ ] Empty thread shows "no comments" state
