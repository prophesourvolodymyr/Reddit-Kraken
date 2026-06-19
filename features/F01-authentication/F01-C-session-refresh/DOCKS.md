# F01-C — Session Refresh

When a `reddit_session` cookie is provided alongside `token_v2`, the app can auto-refresh the short-lived token_v2 (~24h) using the long-lived session cookie (~180 days). This eliminates the need for daily re-pasting.

## Architecture

```
Startup flow:
│  Load token_v2 → ping() → if 401:
│  Load reddit_session → refresh_via_session(session)
│    └── GET https://www.reddit.com/
│        Cookie: reddit_session={value}
│        └── Parse Set-Cookie: token_v2={new_token}
│    └── encrypt + store new token_v2
│    └── Re-create client with fresh token
│
Proactive refresh:
│  Every ~23h (controlled by expires_at - 3600 offset)
│  └── get_valid_token() detects near-expiry
│  └── Attempt refresh_via_session()
│  └── Update AuthTokens in mutex
```

## refresh_via_session Flow

1. GET `https://www.reddit.com/` with `Cookie: reddit_session={value}`
2. Parse `Set-Cookie` headers for `token_v2=`
3. Return new token string
4. Store encrypted in DB for next startup

## States

| State | Behavior |
|-------|----------|
| Token valid | Use as-is |
| Token expired, session valid | Auto-refresh |
| Token expired, session expired | Clear auth, prompt re-login |
| Session provided at login | Encrypt + store for future use |
| No session provided | Token used until expiry, then prompt re-paste |

## Files

- `src-tauri/src/reddit_api.rs:283-310` — `refresh_via_session()`
- `src-tauri/src/reddit_api.rs:313` — `set_session_cookie()`
- `src-tauri/src/lib.rs:1398-1410` — startup refresh attempt

## Verification

- [ ] Paste token_v2 + reddit_session → login
- [ ] Restart after token would be expired → auto-refreshed
- [ ] No session cookie → token just used until expiry
- [ ] refresh_via_session works (hits reddit.com, extracts token_v2)
