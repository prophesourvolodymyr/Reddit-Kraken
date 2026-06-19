# F06 — UI Shell

The visual shell of the application: sidebar navigation, post display views, color accent system, and tab navigation (General / For You). Built with Tailwind + motion/react.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  Sidebar          │  TopBar                          │
│  ┌──────────┐     │  [General | For You] [Compact|Card] │
│  │ 🏠 Home   │     │  r/subreddit icon+name           │
│  │ ──────── │     │                       🔍 💬 🌙   │
│  │ ● r/sub1 │     ├──────────────────────────────────┤
│  │ ● r/sub2 │     │                                  │
│  │ ● r/sub3 │     │  PostList / PostDetail           │
│  │ 📁folder │     │  (scrollable content area)       │
│  │  ● sub4  │     │                                  │
│  │  ● sub5  │     │                                  │
│  │ ──────── │     ├──────────────────────────────────┤
│  │  + Add   │     │  Status bar / FAB                │
│  │  ⚙️      │     │                                  │
│  └──────────┘     └──────────────────────────────────┘
└──────────────────────────────────────────────────────┘
```

## Sub-Features

| Code | Name | Status |
|------|------|--------|
| F06-A | Sidebar System | `in_progress` |
| F06-B | Post Views | `in_progress` |
| F06-C | Color System | `pending` |
| F06-D | Tab Navigation | `in_progress` |

## Dependencies

- F02-C — subreddit metadata for icons and colors
