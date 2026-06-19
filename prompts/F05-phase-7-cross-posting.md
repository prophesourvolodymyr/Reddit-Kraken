# Phase 7 of F05 — Cross-Posting Editor (Full Build)

## Context
Build the entire cross-posting feature from scratch. Master post editor, per-community panels with independent customization, AI adaptation per subreddit, scheduling, draft system, and sequential posting. This is the most complex feature — follow the original spec from F4-docs.md.

## What You Need to Read First
- `features/F05-cross-posting/DOCKS.md`
- `features/F05-cross-posting/F05-A-editor/DOCKS.md`
- `features/F05-cross-posting/F05-B-ai-adapt/DOCKS.md`
- `features/F05-cross-posting/F05-C-scheduling/DOCKS.md`
- `features/F05-cross-posting/F05-D-drafts/DOCKS.md`
- `features/F05-cross-posting/F05-E-posting/DOCKS.md`
- `features/_archive/F4-cross-posting/F4-docs.md` — original UX spec with ASCII diagrams
- `src/components/NewPostModal.tsx` — starting point for editor UI patterns

## What to Build
- Task 1: Create CrossPostEditor component (master panel + subreddit grid)
- Task 2: Create CrossPostPanel component (per-community with all fields)
- Task 3: Add subreddit selector (+ search and add)
- Task 4: Fetch and display flairs per subreddit
- Task 5: AI Adapt button per panel (uses active LLM provider)
- Task 6: Schedule dropdown per panel (Now/30min/2hr/Custom/Queue)
- Task 7: Draft auto-save to SQLite (debounced 2s)
- Task 8: Draft list view (load, resume, delete)
- Task 9: Sequential posting engine (one sub at a time, progress)
- Task 10: Cross-post FAB integration ("Open in Cross-Post Editor" button)

## Files to Create/Modify
- create: `src/components/CrossPostEditor.tsx`
- create: `src/components/CrossPostPanel.tsx`
- create: `src/components/ScheduledQueue.tsx`
- create: `src/components/DraftList.tsx`
- create: `src-tauri/src/cross_post.rs` — draft CRUD + posting logic
- create: `src-tauri/src/schedule.rs` — schedule engine
- create: `src-tauri/src/posting.rs` — sequential posting orchestrator
- modify: `src-tauri/src/db.rs` — add cross_post_drafts + cross_post_items tables
- modify: `src-tauri/src/lib.rs` — add all cross-post commands
- modify: `src/components/NewPostModal.tsx` — add "Open in Cross-Post Editor"
- modify: `src/components/FAB.tsx` — add Cross-Post action

## Verification
- [ ] Create master post with title + body
- [ ] Add 3+ subreddits to batch
- [ ] Customize title/body/flair/NSFW per subreddit
- [ ] AI Adapt rewrites for community tone
- [ ] Copy from Master resets panel
- [ ] Schedule per subreddit (Now, 30min, Custom)
- [ ] Save as draft → appears in draft list
- [ ] Restart app → draft recovered
- [ ] Post All Now → sequential posting with progress
- [ ] Rate limit → wait + retry
- [ ] All 3 posted successfully → links to posts
- [ ] No crash, no data loss

## When You Finish
Report which tasks completed, the files created, and verification results. This will be the largest single feature built.
