# F6 TODOs

## Search Engine
- [ ] Create FTS5 virtual table for posts
- [ ] Sync triggers (insert/update/delete)
- [ ] Implement search query in Rust
- [ ] Rank results by relevance

## Filters
- [ ] Subreddit dropdown filter (from subscribed list)
- [ ] Date range filter (today, week, month, custom)
- [ ] Score range filter (critical, suggested, all, custom)
- [ ] Status filter (new, analyzed, reviewed, etc.)
- [ ] Combined filter logic (AND across filters)
- [ ] Clear all button

## UI
- [ ] Search input with debounce (300ms)
- [ ] Filter bar with dropdowns
- [ ] Search results list
- [ ] Empty state for no results
- [ ] Result count display
- [ ] Sort toggle (date / relevance)

## Tauri Command
- [ ] `search_posts(query, filters, limit, offset)`
