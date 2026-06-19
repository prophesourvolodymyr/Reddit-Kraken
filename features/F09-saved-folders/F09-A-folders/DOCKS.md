# F09-A — Folder Management

CRUD for saved post folders. Sidebar-like interface showing folder list. Create with name input, rename inline, delete with confirmation.

## Files

- Create: `src/components/FolderList.tsx`
- Create: `src-tauri/src/folders.rs` — folder CRUD
- Modify: `src-tauri/src/lib.rs` — `create_folder`, `rename_folder`, `delete_folder`, `list_folders`

## Verification

- [ ] Create folder → appears in list
- [ ] Rename inline
- [ ] Delete with confirmation
- [ ] Reorder folders
