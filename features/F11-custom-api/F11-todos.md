# F11 TODOs

## HTTP Server
- [ ] Rust: Embedded HTTP server (tokio + axum)
- [ ] Bind to 127.0.0.1:9850 only (loopback)
- [ ] Start/stop server with Tauri lifecycle
- [ ] Port conflict detection + fallback

## Auth
- [ ] Token-based auth middleware
- [ ] Token generation (random 32-char hex)
- [ ] Token storage (encrypted in SQLite)
- [ ] Enable/disable API toggle in Settings

## Cross-Post Endpoints
- [ ] POST /api/cross-post (see F4 for logic)
- [ ] Parse request JSON → cross-post engine
- [ ] Return batch results with post URLs

## Draft Endpoints
- [ ] GET /api/drafts — list all drafts
- [ ] POST /api/drafts — create draft
- [ ] GET /api/drafts/{id} — get single draft
- [ ] PUT /api/drafts/{id} — update draft
- [ ] DELETE /api/drafts/{id} — delete draft

## Schedule Endpoints
- [ ] GET /api/schedule — list scheduled posts
- [ ] DELETE /api/schedule/{id} — cancel scheduled post

## Folder Endpoints
- [ ] GET /api/folders — list folders
- [ ] POST /api/folders — create folder
- [ ] GET /api/folders/{id}/posts — folder contents
- [ ] PUT /api/folders/{id} — rename/update
- [ ] DELETE /api/folders/{id} — delete folder
- [ ] POST /api/folders/{id}/posts — add post
- [ ] DELETE /api/folders/{id}/posts/{id} — remove post
- [ ] GET /api/folders/{id}/export — export links

## Subreddits & Posts
- [ ] GET /api/subreddits — list subscribed
- [ ] GET /api/posts — filtered post list
- [ ] GET /api/posts/worth-responding — engagement queue

## Settings UI
- [ ] Enable/disable API toggle
- [ ] Port configuration
- [ ] Token display + regenerate + copy
- [ ] API status indicator
- [ ] curl example snippet

## Polish
- [ ] Rate limiting (60 req/min per token)
- [ ] Consistent error response format
- [ ] Request logging
