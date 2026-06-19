# F02-A — Post Fetching

Pull posts from Reddit in real-time when user clicks a subreddit, and via background scheduler every 15 minutes. Posts stored in SQLite with deduplication by Reddit `t3_` ID. Thumbnail URLs captured. Supports both OAuth Bearer token and manual token_v2 auth.

## Architecture

```
Frontend: PostList.useEffect → invoke("get_posts", {subredditId})

Backend: get_posts() 
│  If client connected + sub selected:
│  └── fetch_posts_live_inner()
│       └── RedditClient::fetch_posts(sub_name)
│            └── GET oauth.reddit.com/r/{sub}/new.json?limit=25
│            └── INSERT OR IGNORE INTO posts (...)
│  └── get_posts_inner() → SELECT from posts WHERE archived=0
│
Background: Scheduler::poll_all_subs()
│  For each enabled sub: RedditClient::fetch_posts(name)
│  └── store_posts() → INSERT OR IGNORE
```

## API Endpoint

```
GET https://oauth.reddit.com/r/{subreddit}/new.json?limit=25
Authorization: Bearer {token_v2}
User-Agent: Reddit-Kraken/0.1.0
```

## Response Mapping

| API Field | Post Field |
|-----------|-----------|
| `data.children[].data.id` | `id` (prefixed `t3_`) |
| `data.children[].data.subreddit_id` | `subreddit_id` |
| `data.children[].data.title` | `title` |
| `data.children[].data.selftext` | `body` |
| `data.children[].data.author` | `author` |
| `data.children[].data.url` | `url` |
| `data.children[].data.thumbnail` | `thumbnail_url` (filtered: only `http*`) |
| `data.children[].data.score` | `score` |
| `data.children[].data.num_comments` | `num_comments` |
| `data.children[].data.created_utc` | `created_utc` |
| `data.children[].data.link_flair_text` | `flair_text` |
| `data.children[].data.over_18` | `over_18` |
| `data.children[].data.spoiler` | `spoiler` |

## Files

- `src-tauri/src/reddit_api.rs:350-410` — `fetch_posts()`, RawPost mapping
- `src-tauri/src/lib.rs:178-230` — `get_posts`, `fetch_posts_live`, `fetch_posts_live_inner`
- `src-tauri/src/lib.rs:286-375` — `get_posts_inner`
- `src-tauri/src/scheduler.rs` — background polling loop
- `src-tauri/src/models.rs:42-62` — `Post` struct
- `src/components/PostList.tsx` — post list UI with auto-refresh

## Verification

- [ ] Click subreddit → posts appear (live fetch + cache)
- [ ] Thumbnails load for posts with images
- [ ] Scheduler stores new posts every 15 min
- [ ] No duplicate posts (INSERT OR IGNORE by id)
- [ ] 429 rate limit → handled with retry
- [ ] Network error → graceful failure, cached posts shown
