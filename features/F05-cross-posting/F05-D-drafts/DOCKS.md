# F05-D — Drafts

Every cross-post batch auto-saves as draft. Debounced save after keystroke. Draft list view with preview and resume. Crash recovery on next launch. Delete with confirmation.

## Draft System

- Every batch is a draft until posted
- Auto-save: debounced after every keystroke (2s)
- Draft ID generated on first edit (UUID)
- Stored in SQLite as JSON blobs (master + items)
- On launch: check for unsent drafts → recovery toast → reopen
- Drafts view: list with preview, click to resume, delete with confirm

## Files

- Create: `src-tauri/src/drafts.rs` — draft CRUD
- Create: `src/components/DraftList.tsx` — draft list view
- Modify: `src-tauri/src/lib.rs` — `save_draft`, `load_draft`, `list_drafts`, `delete_draft`
- Modify: `src-tauri/src/db.rs` — `cross_post_drafts` + `cross_post_items` tables

## Verification

- [ ] Auto-save triggers after typing pause
- [ ] Close editor → draft saved
- [ ] Restart app → recovery toast with draft count
- [ ] Draft list shows all saved drafts
- [ ] Click draft → editor opens with content restored
- [ ] Delete draft → removed from DB
