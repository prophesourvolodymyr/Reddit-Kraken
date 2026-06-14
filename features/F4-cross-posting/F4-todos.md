# F4 TODOs

## Cross-Post Editor UI
- [ ] Master post editor (title + body + AI assist)
- [ ] Multi-sub grid layout (2 panels per row)
- [ ] Per-community panel component
- [ ] "Add subreddit" selector to choose communities
- [ ] Individual title/body editors per community
- [ ] Per-community flair selector (fetched from API)
- [ ] Per-community NSFW/Spoiler toggles
- [ ] Per-community attachment upload
- [ ] Per-community tags input
- [ ] "AI Adapt" button per community panel
- [ ] "Copy from Master" button per community panel
- [ ] Remove community from batch

## Scheduling
- [ ] Schedule dropdown per community (now/later/custom)
- [ ] Batch schedule inheritance
- [ ] Schedule confirmation dialog
- [ ] Scheduled queue view
- [ ] Rust: schedule engine (store + execute at time)

## Draft System
- [ ] Auto-save on keystroke (debounced 2s)
- [ ] Draft list view (accessible from Cross-Post tab)
- [ ] Open draft to resume editing
- [ ] Delete draft with confirmation
- [ ] Rust: SQLite draft storage + retrieval
- [ ] Recovery on unclean exit

## Posting
- [ ] Sequential posting (one sub at a time)
- [ ] Post progress indicator
- [ ] Error handling (rate limit, ban, API down)
- [ ] Retry failed posts
- [ ] Post results display
- [ ] Rust: POST /api/submit per subreddit
- [ ] Rust: POST /api/upload_media for attachments

## FAB Integration
- [ ] "Open in Cross-Post Editor" button in FAB modal
- [ ] Pre-fill cross-post editor with single sub selected

## Rust Modules
- [ ] `cross_post.rs` — draft CRUD, post orchestration
- [ ] `submit.rs` — Reddit API submit calls
- [ ] `schedule.rs` — delayed posting engine
- [ ] `media.rs` — image upload handling
