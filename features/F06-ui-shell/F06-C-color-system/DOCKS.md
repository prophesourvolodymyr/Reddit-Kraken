# F06-C — Color System

Extract dominant color from subreddit community icon. Use as sidebar glow effect (gradient bleed) under the TopBar when subreddit is active. Each subreddit gets a unique, organic accent derived from its visual identity.

## Architecture (To Build)

```
Subreddit added/imported:
│  icon_url is already stored from /about.json
│  ↓
│  extract_dominant_color(icon_url)
│  └── Download icon image (or use provided URL)
│  └── Downsample to 1×1 → get average color
│  └── OR: color-thief algorithm for palette extraction
│  └── Store as accent_color in subreddits table
│
Sidebar rendering:
│  renderAvatar: if icon_url → <img>, else → colored initials (accent_color as bg)
│
Glow effect (App.tsx bleedRef):
│  background: linear-gradient(180deg, {accent_color}18 → transparent)
│  Only shown when subreddit is active
```

## Fallback Colors

If no icon or extraction fails, use Reddit orange (`#ff4500`) as default.

## Files

- Create: `src-tauri/src/color.rs` — `extract_dominant_color(image_url) -> String`
- Modify: `src-tauri/src/lib.rs` — call extraction after `add_subreddit` / `import_subscriptions`
- Modify: `src/components/Sidebar.tsx:83-85` — `subColor()` should prefer DB accent_color over hardcoded SUB_COLORS map
- Modify: `src/App.tsx:245` — bleed gradient already uses `accent_color`

## Verification

- [ ] Each subreddit gets unique accent color from its icon
- [ ] Sidebar initials bg color matches sub's identity
- [ ] Glow bleed at TopBar matches subreddit color
- [ ] Subreddit with no icon gets orange default
- [ ] Color doesn't change on every app restart (cached)
