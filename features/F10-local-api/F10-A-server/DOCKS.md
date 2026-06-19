# F10-A — API Server

HTTP server bound to `127.0.0.1` on configurable port. Serves REST endpoints for all app functionality. Bearer token authentication.

## Tech

- axum or tiny_http for embedded HTTP
- Tokio for async request handling
- Bearer token from Settings → validated per request

## Files

- Create: `src-tauri/src/api_server.rs`

## Verification

- [ ] `curl http://127.0.0.1:3840/api/status` works
- [ ] Token auth correctly blocks unauthorized requests
- [ ] Port configurable in Settings
