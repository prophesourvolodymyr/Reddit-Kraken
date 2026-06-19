# F03 — For You Feed

Algorithmically ranked feed from all subscribed subreddits. Posts scored by engagement (upvote ratio, comment count, freshness). Mixed across communities. This is the default landing page — where users go to find discussions worth their time. Replaces the current "digested" view which just shows all posts.

## Architecture (To Build)

```
┌──────────────────────────────────────────────────┐
│                For You Feed Pipeline              │
│                                                  │
│  1. Fetch 100 most recent posts from all subs    │
│  2. Score each post:                             │
│     engagement = (score × upvote_ratio)           │
│                + (num_comments × comment_weight)  │
│     freshness = decay(age_hours, half_life=6h)   │
│     final_score = engagement × freshness         │
│  3. Sort by final_score descending               │
│  4. Dedup by subreddit (max 5 per sub)           │
│  5. Display as grouped feed with date labels     │
└──────────────────────────────────────────────────┘
```

## Scoring Formula

```
engagement_score = score × upvote_ratio + num_comments × 3
freshness_decay = 0.5 ^ (age_hours / 6)
final = engagement_score × freshness_decay × 1000
```

## Sub-Features

| Code | Name | Status |
|------|------|--------|
| F03-A | Scoring Engine | `pending` |
| F03-B | Feed Composition | `pending` |

## States

| State | UI |
|-------|-----|
| Empty | "Add subreddits and enable polling to see your personalized feed" |
| Loading | Skeleton cards |
| Loaded | Scored posts grouped by date-subreddit |
| Error | Retry button |

## Dependencies

- F02-A — post fetching must work
- F04 — AI scoring can augment engagement scoring later

## Verification

- [ ] Feed shows posts from multiple subreddits
- [ ] High-engagement posts rank higher
- [ ] Fresh posts outrank stale ones
- [ ] No single subreddit dominates (max 5 posts)
- [ ] Auto-refreshes when new posts arrive
