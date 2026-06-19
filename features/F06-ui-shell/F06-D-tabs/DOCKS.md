# F06-D — Tab Navigation

Two view tabs at the top of the content area.

| Tab | Label | Content | Status |
|-----|-------|---------|--------|
| General | "General" | Most recent posts from selected subreddit (or all) | Built |
| For You | "For You" | AI-analyzed + algorithmic feed (default landing) | Needs fix |

**Current bug**: "For You" shows all posts grouped by date, and "General" shows per-sub feed. The labels are correct but the behavior is reversed from the spec. Fix: "For You" should be the algorithmic engagement-ranked feed (F03). "General" should show chronological recent posts from the selected subreddit.

**For You** is the default landing page (no subreddit selected). When a sub is clicked, the app switches to General view automatically.

## Files

- `src/components/TopBar.tsx` — `activeView` toggle buttons
- `src/components/PostList.tsx` — `mode` prop ("digested" → For You, "normal" → General)
- `src/App.tsx` — `activeView` state, `handleSelectSub` sets view to "general"

## Verification

- [ ] Default landing: For You tab active, algorithmic feed shown
- [ ] Click subreddit: switches to General, shows recent posts
- [ ] Click For You tab: switches back to algorithmic feed
- [ ] Tab labels match behavior
