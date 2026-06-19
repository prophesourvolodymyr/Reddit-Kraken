# F09-B — Content Organization

Save posts to folders. Move between folders. Remove from folders. Batch select and move. PostCard "Save" button integration.

## Files

- Modify: `src/components/PostCard.tsx` — Save button wired to backend
- Modify: `src-tauri/src/lib.rs` — `save_post`, `unsave_post`, `move_post`
- Create: `src/components/SavedView.tsx` — show saved posts by folder

## Verification

- [ ] Save post → added to selected folder
- [ ] Unsave → removed from folder
- [ ] Move between folders
- [ ] Batch select + move
