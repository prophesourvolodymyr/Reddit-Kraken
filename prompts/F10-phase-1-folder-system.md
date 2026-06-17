# Phase 1 of F10 — Saved Folders System

## Context
Build folder organization and export system. Users create folders, save posts to them from multiple entry points, and batch export links for external use. Depends on F2 (worth_responding posts exist to save) and F1 (posts table exists).

## What You Need to Read First
- `features/F10-saved-folders/F10-docs.md` — folder layout, save actions flow, export formats, schema
- `features/F10-saved-folders/F10-todos.md` — task checklist
- `src-tauri/src/db.rs` — current schema
- `src-tauri/src/lib.rs` — Tauri command patterns (add_subreddit, get_posts style)
- `src/components/Sidebar.tsx` — folder icons section at bottom
- `src/components/PostCard.tsx` — current card layout, where [Save to Folder] button goes
- `src/components/AIRespondView.tsx` — Engagement cards with action buttons

## Codebase Learnings
- Posts table has `saved INTEGER DEFAULT 0` column — set to 1 when saved to any folder
- Sidebar already has `renderFolderIcon()` returning a 2x2 mini-dot grid for folder visual
- `SidebarItem` type supports `kind: "folder"` with `subs: Subreddit[]` — this is for subreddit grouping folders, NOT saved folders. Saved folders are separate.
- PostCard has `post.worth_responding` orange border — saved state can use a bookmark icon indicator
- Tauri commands use `State<AppState>` with `state.db.conn.lock().unwrap()` pattern

## What to Build
- Task 1: Add `saved_folders` and `saved_folder_items` tables to db.rs (schema in F10-docs.md)
- Task 2: Rust `folders.rs` module — folder CRUD operations
- Task 3: Tauri commands: `create_folder`, `rename_folder`, `delete_folder`, `get_folders`, `get_folder_posts`, `save_post_to_folder`, `remove_post_from_folder`
- Task 4: React `FolderPicker` modal — reusable component showing folder list + [Create New Folder]
- Task 5: Add [Save to Folder] button to PostCard (appears on hover or in action row)
- Task 6: Add [Save to Folder] button to AIRespondView engagement cards
- Task 7: Add [Save to Folder] button to PostDetail
- Task 8: React `SavedFolderView` — folder list (name, post count, rename/delete actions) + folder content view (posts grouped by date)
- Task 9: React create folder modal — name + optional description
- Task 10: Batch export: checkbox selection, copy to clipboard (.txt), download .csv
- Task 11: Sidebar integration — saved folder icons in bottom section, click to open in main view

## Files to Create/Modify
- create: `src-tauri/src/folders.rs`
- create: `src/components/FolderPicker.tsx`
- create: `src/components/SavedFolderView.tsx`
- create: `src/components/CreateFolderModal.tsx`
- modify: `src-tauri/src/db.rs` — add saved_folders + saved_folder_items tables
- modify: `src-tauri/src/lib.rs` — add folder Tauri commands + register
- modify: `src/components/PostCard.tsx` — add [Save to Folder] button
- modify: `src/components/AIRespondView.tsx` — add save action
- modify: `src/components/PostDetail.tsx` — add save action
- modify: `src/components/Sidebar.tsx` — saved folder icons section
- modify: `src/App.tsx` — route to SavedFolderView on folder click
- modify: `src/types.ts` — add SavedFolder, FolderItem types

## Verification
- [ ] `cargo check` — no errors
- [ ] `npm run build` — no errors
- [ ] Create folder, rename folder, delete folder works end-to-end
- [ ] Save post to folder from PostCard, Engagement card, PostDetail
- [ ] Same post not duplicated in same folder (UNIQUE constraint)
- [ ] Folder picker shows folders with post counts
- [ ] Folder content view shows posts grouped by date
- [ ] Export: copy selected links, download .txt and .csv
- [ ] Sidebar shows saved folder icons, clicking opens folder view
- [ ] Empty folder shows "No saved posts yet"
- [ ] Delete folder cascades (removes items)

## When You Finish
Report what was built, what was verified, and any issues found. Mark tasks in `features/F10-saved-folders/F10-todos.md` and `CYCLES.md`.
