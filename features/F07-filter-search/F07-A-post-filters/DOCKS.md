# F07-A — Post Filters

Filter visible posts by: subreddit, flair, minimum score, time range, NSFW toggle, spoiler toggle, keyword search in titles. Apply as SQL WHERE clauses on `get_posts`.

## Filter Options

| Filter | SQL |
|--------|-----|
| Subreddit | `subreddit_id = ?` |
| Flair | `flair_text = ?` |
| Min score | `score >= ?` |
| Time range | `created_utc >= ?` |
| NSFW hide | `over_18 = 0` |
| Keyword | `title LIKE '%?%'` |

## Files

- Create: `src/components/FilterView.tsx` — filter bar with dropdowns (stub exists)
- Modify: `src-tauri/src/lib.rs` — `get_posts` with filter params

## Verification

- [ ] Filter by subreddit narrows results
- [ ] Score filter hides low-score posts
- [ ] Keyword search finds matching titles
- [ ] Clear filters resets to full list
