# F02-C — Subreddit Metadata

Extract full subreddit metadata from Reddit API: icon image, banner image, primary color, description, subscriber count, creation date. Used for sidebar icons, color accent glow effects, and subreddit info display.

## Architecture

```
Adding subreddit:
│  add_subreddit(name) → RedditClient::fetch_subreddit_info(name)
│  └── GET oauth.reddit.com/r/{sub}/about.json
│  └── Maps: id → "t5_{id}", display_name → name, icon_img → icon_url,
│            primary_color → accent_color, public_description → description,
│            subscribers, created_utc, banner_img → banner_url
│  └── INSERT INTO subreddits (id, name, icon_url, accent_color, ...)

Importing subscriptions:
│  import_subscriptions() → fetch_my_subreddits()
│  └── GET oauth.reddit.com/subreddits/mine/subscriber?limit=100
│  └── Same SubredditAboutData mapping
│  └── INSERT OR IGNORE (dedup by name)

Display:
│  get_subreddits() → SELECT ... FROM subreddits ORDER BY sort_order
│  Sidebar: renders icon_url as <img>, or initials with accent_color bg
│  Glow effect: accent_color used for gradient bleed
```

## API Endpoint

```
GET https://oauth.reddit.com/r/{subreddit}/about.json
Authorization: Bearer {token_v2}
```

## DB Columns

| Column | Source | Purpose |
|--------|--------|---------|
| `id` | `"t5_{api_id}"` | Reddit fullname (PK) |
| `name` | `display_name` | Plain subreddit name |
| `icon_url` | `icon_img` | Community icon for sidebar |
| `accent_color` | `primary_color` | Key color for glow effects |
| `banner_url` | `banner_img` | Banner image for header |
| `description` | `public_description` | Subreddit description text |
| `subscribers` | `subscribers` | Member count |
| `created_utc` | `created_utc` | Subreddit creation timestamp |

## Files

- `src-tauri/src/reddit_api.rs:424-466` — `fetch_subreddit_info()`, `fetch_my_subreddits()`
- `src-tauri/src/lib.rs:62-168` — `add_subreddit`
- `src-tauri/src/lib.rs:1069-1090` — `import_subscriptions`
- `src-tauri/src/models.rs:22-31` — `SubredditAboutData`
- `src-tauri/src/models.rs:8-18` — `Subreddit` struct
- `src/components/Sidebar.tsx:396-422` — `renderAvatar` (icon or initials)

## Verification

- [ ] Import subscriptions → all user's subs added with icons
- [ ] Manual add subreddit → icon and metadata populated
- [ ] Sidebar shows subreddit icon or colored initials
- [ ] Accent color stored for each subreddit
