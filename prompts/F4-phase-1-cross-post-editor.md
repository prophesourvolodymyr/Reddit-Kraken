# Phase 1 of F4 — Cross-Posting Editor

## Context
The killer feature: write one master post, tailor it per community, post across multiple subreddits sequentially or on a schedule. Full draft system with auto-save. Depends on F1 (subreddits exist, reddit_api has auth) and F10 (save-to-folder for batch export).

## What You Need to Read First
- `features/F4-cross-posting/F4-docs.md` — full editor layout, per-community panel, schedule, posting flow
- `features/F4-cross-posting/F4-todos.md` — task checklist
- `src-tauri/src/reddit_api.rs` — existing OAuth flow, fetch_posts, fetch_subreddit_info
- `src-tauri/src/db.rs` — current schema
- `src-tauri/src/lib.rs` — Tauri command patterns
- `src/components/NewPostModal.tsx` — current FAB modal with disabled "Open in Cross-Post Editor" button
- `src/App.tsx` — cross-post view is currently a placeholder div, needs CrossPostView component

## Codebase Learnings
- `reddit_api.rs` has `authenticate()` and `reddit_get<T>()` — submitting posts needs a new `reddit_post()` method or direct reqwest call
- Post type has `subreddit_id`, `title`, `body`, `flair_text`, `over_18`, `spoiler` fields
- Subreddit type has `id`, `name`, `icon_url`, `accent_color`
- `add_subreddit` generates placeholder IDs — real subreddit info comes from `fetch_subreddit_info` which returns proper `t5_*` ID
- SettingsPanel has API section with port/token — cross-post could integrate later with local API
- NewPostModal already has NSFW/Spoiler toggles, flair selector, post type selector — cross-post panels reuse similar controls
- FAB tooltip shows "New post in r/{activeSub.name}" — cross-post button should pre-fill with active sub

## What to Build
- Task 1: Add `cross_post_drafts` and `cross_post_items` tables to db.rs (schema in F4-docs.md)
- Task 2: Rust `cross_post.rs` module — draft CRUD, post orchestration
- Task 3: Rust `submit.rs` module — Reddit API POST /api/submit per subreddit
- Task 4: Tauri commands: `save_cross_draft`, `get_cross_drafts`, `get_cross_draft`, `delete_cross_draft`, `post_to_subreddit`, `post_cross_batch`
- Task 5: React `CrossPostView` — master post editor at top, per-community grid below
- Task 6: React `PerSubPanel` component — editable title/body, flair, NSFW/Spoiler, tags, schedule, AI Adapt button, Copy from Master, Remove
- Task 7: React `SubredditMultiSelect` — dropdown with checkboxes to add/remove subs from batch
- Task 8: Auto-save draft on keystroke (debounced 2s timer → save to SQLite)
- Task 9: Draft list view — accessible from Cross-Post tab, click to resume editing
- Task 10: Confirmation dialog for posting — shows subs + schedule, [Cancel] [Post]
- Task 11: Sequential posting with progress indicator per sub (posting... / posted / error)
- Task 12: React `ScheduleQueueView` — list pending scheduled posts, cancel option
- Task 13: Enable "Open in Cross-Post Editor" in NewPostModal → pre-fills with active sub
- Task 14: AI integration — "AI Adapt" calls `LlmProvider::enhance_text()` with per-sub context, "AI Enhance/Rewrite/Expand" on master post

## Files to Create/Modify
- create: `src-tauri/src/cross_post.rs`
- create: `src-tauri/src/submit.rs`
- create: `src/components/CrossPostView.tsx`
- create: `src/components/PerSubPanel.tsx`
- create: `src/components/SubredditMultiSelect.tsx`
- create: `src/components/ConfirmPostDialog.tsx`
- create: `src/components/DraftListView.tsx`
- create: `src/components/ScheduleQueueView.tsx`
- modify: `src-tauri/src/db.rs` — add cross_post_drafts + cross_post_items tables
- modify: `src-tauri/src/lib.rs` — add cross-post Tauri commands + register
- modify: `src-tauri/src/reddit_api.rs` — add `submit_post()` method
- modify: `src/App.tsx` — wire CrossPostView to cross-post tab, add view routing for drafts/schedule
- modify: `src/components/NewPostModal.tsx` — enable "Open in Cross-Post Editor" button

## Verification
- [ ] `cargo check` — no errors
- [ ] `npm run build` — no errors
- [ ] CrossPostView renders master editor + per-community grid
- [ ] Add/remove subreddits from batch
- [ ] Per-sub panel: edit title/body, set flair, NSFW/Spoiler, copy from master
- [ ] Auto-save fires, draft persists in SQLite across app restart
- [ ] Draft list shows saved drafts, click to resume editing
- [ ] Post confirmation dialog shows before submitting
- [ ] Draft delete with confirmation
- [ ] "Open in Cross-Post Editor" from FAB modal works (pre-fills active sub)
- [ ] AI Adapt / AI Enhance buttons call existing LlmProvider
- [ ] Scheduled queue view shows pending items

## When You Finish
Report what was built, what was verified, and any issues found. Mark tasks in `features/F4-cross-posting/F4-todos.md` and `CYCLES.md`.
