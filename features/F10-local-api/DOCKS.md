# F10 — Local API

Embedded HTTP server (loopback-only) for scripting and automation. REST endpoints for posts, subreddits, and actions. Bearer token auth. Curl-able from terminal.

## Sub-Features

| Code | Name | Status |
|------|------|--------|
| F10-A | API Server | `pending` |
| F10-B | Automation | `pending` |

## Endpoints (Planned)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/posts` | List recent posts |
| GET | `/api/posts/:id` | Post detail + comments |
| GET | `/api/subreddits` | List subscribed subreddits |
| POST | `/api/subreddits` | Add subreddit |
| POST | `/api/submit` | Create post |
| POST | `/api/comment` | Reply to post |
| GET | `/api/status` | Connection status |

## Settings UI (Built)

- Local API tab in SettingsPanel: enable/disable toggle
- Port configuration (1024–65535)
- Access token generation/regeneration
- Example curl command display
- Status indicator (running/stopped/unknown)

## Files

- `src/components/SettingsPanel.tsx` — Local API tab (UI built, backend not)
- Create: `src-tauri/src/api_server.rs` — HTTP server (axum/warp)
- Modify: `src-tauri/src/lib.rs` — `start_api_server`, `stop_api_server`

## Verification

- [ ] Server starts on configured port
- [ ] `GET /api/posts` returns JSON
- [ ] Bearer token auth required
- [ ] Invalid token → 401
- [ ] Server stops on app close
