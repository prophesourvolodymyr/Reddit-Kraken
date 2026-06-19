# F6 TODOs

## Search Engine
- [ ] Create FTS5 virtual table for posts
- [ ] Sync triggers (insert/update/delete)
- [ ] Implement search query in Rust
- [ ] Rank results by relevance

## Filters
- [ ] Subreddit dropdown filter (from subscribed list)
- [ ] Date range filter (today, week, month, custom)
- [ ] Worth responding filter
- [ ] Saved/not saved filter
- [ ] Combined filter logic (AND across filters)
- [ ] Clear all button

## UI
- [ ] Search input with debounce (300ms)
- [ ] Filter bar with dropdowns
- [ ] Search results list
- [ ] Empty state for no results
- [ ] Result count display
- [ ] Sort toggle (date / relevance)
- [ ] [Save to Folder] button per result

## Batch Export
- [ ] Select checkboxes on search results
- [ ] Select all / select none / select worth responding buttons
- [ ] Copy selected links to clipboard
- [ ] Download selected links as .txt file

## Tauri Command
- [ ] `search_posts(query, filters, limit, offset)`
