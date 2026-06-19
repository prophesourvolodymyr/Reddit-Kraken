# F06-B — Post Views

Compact and card layout modes for post lists. Full post detail view with comments. Image lightbox with pan/zoom. Skeleton loading states.

## Components

### PostCard
Two modes: **compact** (horizontal row with vote column, title, body preview, thumbnail) and **card** (full-width card with large image, meta line, action buttons). "Worth responding" badge. Animated scroll-in via useInView.

### PostDetail
Full post view: back button, header (sub, author, time, flair), title with NSFW/Spoiler tags, thumbnail image, body text, action footer (vote, comment count, share, reply). Comment section with threaded tree, collapse, sort selector.

### ImageViewer
Full-screen overlay with pan (drag), zoom (wheel + double-click), reset button, percentage display. Body scroll locked while open.

## Files

- `src/components/PostCard.tsx` — compact + card list items
- `src/components/PostDetail.tsx` — full post + comments view
- `src/components/ImageViewer.tsx` — image lightbox
- `src/components/PostList.tsx` — list orchestrator with loading/empty/error states

## Verification

- [ ] Compact mode renders correctly
- [ ] Card mode shows thumbnails
- [ ] PostDetail opens on click
- [ ] ImageViewer opens on thumbnail click
- [ ] Loading skeletons match view mode
