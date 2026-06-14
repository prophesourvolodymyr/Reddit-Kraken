# F10 TODOs

## Data Layer
- [ ] Create `saved_folders` table in SQLite
- [ ] Create `saved_folder_items` table with UNIQUE(folder_id, post_id)
- [ ] Folder CRUD operations in Rust

## Save Actions
- [ ] [Save to Folder] button on post cards
- [ ] [Save to Folder] button in Engagement Queue
- [ ] [Save to Folder] button in Post Detail
- [ ] [Save to Folder] button in search results
- [ ] Batch save from search results (multi-select)
- [ ] Folder picker modal (list folders + create new option)

## Folder Management
- [ ] Create folder modal (name + optional description)
- [ ] Rename folder (inline edit)
- [ ] Delete folder (with confirmation, cascading)
- [ ] Folder list view in main content area
- [ ] Folder content view (posts grouped by date)
- [ ] Remove individual posts from folder
- [ ] Remove all posts from folder

## Batch Export
- [ ] Select checkboxes on folder items
- [ ] Select all / select none
- [ ] Copy selected links to clipboard
- [ ] Download selected links as .txt
- [ ] Download selected links as .csv (URL + title + subreddit)
- [ ] Export link count indicator

## UI Integration
- [ ] Folder icons in sidebar bottom section
- [ ] Click folder icon to open in main view
- [ ] Folder picker component (reusable modal)
- [ ] Empty folder state

## Rust Modules
- [ ] `folders.rs` — folder CRUD, item management
- [ ] `export.rs` — link export logic
