# F03-A — Scoring Engine

Calculate per-post scores based on engagement and freshness. Configurable weights. Used by the For You feed to rank posts.

## Architecture (To Build)

```
struct PostScore {
    post_id: String,
    engagement: f64,     // from votes + comments
    freshness: f64,       // time decay
    final: f64,           // engagement × freshness
}

fn score_posts(posts: Vec<Post>) -> Vec<PostScore> {
    let now = chrono::Utc::now().timestamp();
    for post in posts {
        let upvote_ratio = 0.85; // default, API provides actual
        let age_hours = (now - post.created_utc as i64) as f64 / 3600.0;
        let engagement = post.score as f64 * upvote_ratio + post.num_comments as f64 * 3.0;
        let freshness = 0.5_f64.powf(age_hours / 6.0);
        let final_score = engagement * freshness * 1000.0;
    }
}
```

## Files

- `src-tauri/src/feed.rs` (new) — `score_posts()`, `PostScore` struct
- `src-tauri/src/lib.rs` — `get_for_you_feed` command

## Verification

- [ ] Post with 1000 upvotes ranks higher than post with 10
- [ ] Post from 1h ago ranks higher than post from 24h ago
- [ ] Post with 0 upvotes but 100 comments scored reasonably
