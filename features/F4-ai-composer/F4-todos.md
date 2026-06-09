# F4 TODOs

## Reply Composer
- [ ] Inline reply editor in PostDetail view
- [ ] AI suggestion buttons (3 options: quick/detailed/ask)
- [ ] AI Enhance / Rewrite / Fix Grammar / Expand buttons
- [ ] Click-to-insert AI suggestion into editor
- [ ] [Post to Reddit] button → API call
- [ ] Confirmation dialog before posting

## New Post Composer
- [ ] FAB component (bottom-right, floating)
- [ ] FAB auto-detects current sub (via sidebar selection)
- [ ] FAB tooltip showing detected sub
- [ ] NewPostModal with subreddit dropdown
- [ ] Post type selector (Text / Link / Image)
- [ ] Title input with AI Suggest button
- [ ] Body editor with AI buttons
- [ ] Flair selector (fetched from API)
- [ ] NSFW / Spoiler toggles
- [ ] Image upload button → Reddit media API
- [ ] Save Draft / Post to Reddit buttons

## Reddit Posting API
- [ ] POST /api/submit for new posts
- [ ] POST /api/comment for replies
- [ ] Image upload via /api/upload_media
- [ ] Error handling (rate limits, banned, removed)
- [ ] Draft persistence in SQLite

## Rust Modules
- [ ] `composer.rs` — post/comment submission logic
- [ ] `media.rs` — image upload handling
- [ ] `drafts.rs` — draft storage & retrieval
