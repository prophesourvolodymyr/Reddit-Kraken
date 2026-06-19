# F01-A — Token Input

UI and backend for accepting Reddit credentials. Three auth modes with appropriate form fields. Token validation via ping.

## Architecture

```
SettingsPanel → Reddit Account Tab
│
├── Token mode (default)
│   └── token_v2 textarea + reddit_session textarea (optional)
│       └── configure_manual_token(tokenV2, username, sessionCookie?)
│           └── RedditClient::new_with_token → ping()
│
├── Password mode
│   └── username + password inputs
│       └── configure_reddit_session(username, password)
│           └── RedditClient::new_with_session → authenticate() → POST /api/login
│
└── OAuth mode
    └── client_id + client_secret + username + password inputs
        └── configure_reddit_auth(clientId, clientSecret, username, password)
            └── RedditClient::new → authenticate() → POST /api/v1/access_token
```

## States

| State | UI |
|-------|-----|
| Form empty | Placeholder text, Login button disabled |
| Form filled | Login button enabled |
| Connecting | Button shows "Connecting…", form disabled |
| Error | Red error box with message |
| Success | Green message "Connected as u/{name}" |

## Files

- `src/components/SettingsPanel.tsx` — Reddit Account tab, auth mode toggle, form fields, login handler
- `src/types.ts` — `RedditStatus`
- `src-tauri/src/lib.rs` — `configure_manual_token`, `configure_reddit_session`, `configure_reddit_auth`

## Verification

- [ ] Token mode: paste token_v2 → Login → connected
- [ ] Token mode: Login disabled when fields empty
- [ ] Password mode: form shown, Login enabled when filled
- [ ] OAuth mode: client_id + secret fields shown
- [ ] Wrong credentials → error shown, not crash
