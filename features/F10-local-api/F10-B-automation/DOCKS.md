# F10-B — Automation

Scripting and automation via the local API. Curl examples, webhook triggers, headless mode. Cron-style scheduling via external tools.

## Use Cases

- `curl -H "Authorization: Bearer TOKEN" http://127.0.0.1:3840/api/posts` → get latest posts
- Webhook: new post in r/python → POST to Slack/Discord
- Daily digest: cron job hits API, formats as email
- Headless: app runs in background, fully scriptable

## Files

- Modify: `src/components/SettingsPanel.tsx` — curl example display

## Verification

- [ ] Curl examples in Settings work
- [ ] External script can query posts
- [ ] Webhook triggers external service
