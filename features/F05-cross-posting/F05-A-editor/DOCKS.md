# F05-A — Editor

Master post editor + per-community panels in a grid layout. Write once, customize per subreddit. Flair selectors, NSFW/Spoiler toggles, attachment upload per community. "Copy from Master" button resets any panel to base content.

## Key Interactions

- **Master panel**: title + body with AI assist buttons
- **Add subreddit**: search + select from subscribed subs
- **Per-community panel** (2 per row grid):
  - Title field — pre-filled from master, editable
  - Body field — pre-filled from master, editable
  - Flair dropdown — fetched from subreddit API
  - Attachment upload — per-community images/links
  - NSFW / Spoiler toggles
  - Tags input — subreddit-specific labels
  - Schedule dropdown — Now / 30min / 2hr / Custom / Queue
  - AI Adapt button — rewrites for community tone
  - Copy from Master — resets to master content
  - Remove — drops this sub from batch

## Files

- Create: `src/components/CrossPostEditor.tsx` — full editor component
- Create: `src/components/CrossPostPanel.tsx` — per-community panel
- Modify: `src/components/NewPostModal.tsx` — "Open in Cross-Post Editor" button

## Verification

- [ ] Master post editable
- [ ] Add/remove subreddits from batch
- [ ] Per-panel title/body independent of master
- [ ] Flair dropdown populated from subreddit
- [ ] Copy from Master resets panel content
