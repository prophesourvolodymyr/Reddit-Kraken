# F07-B — Subreddit Search

Search Reddit for communities. Preview subreddit info (icon, description, subscriber count) before adding. Trending/popular suggestions. Built as `AddSubredditModal` with search.

## What's Built

- `AddSubredditModal` — enter subreddit name, click Add, calls `add_subreddit`
- `add_subreddit` command — fetches `/about.json` if client connected
- Deduplication on name (existing sub returns immediately)

## What's Missing

- Search-as-you-type (currently just a name input with Add button)
- Preview before adding (icon, description, subscribers shown before confirm)
- Trending/popular suggestions

## Files

- `src/components/AddSubredditModal.tsx` — already built
- `src-tauri/src/lib.rs:62-168` — `add_subreddit` command
- `src-tauri/src/reddit_api.rs:424-466` — `fetch_subreddit_info`

## Verification

- [ ] Type subreddit name → preview appears
- [ ] Preview shows icon, description, subscriber count before confirming
- [ ] Add → subreddit appears in sidebar
- [ ] Duplicate → returns existing without error
