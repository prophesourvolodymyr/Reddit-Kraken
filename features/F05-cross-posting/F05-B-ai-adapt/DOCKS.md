# F05-B — AI Adapt

AI rewrites the master post for a specific subreddit's tone and audience. Triggered per community panel. Uses the active LLM provider.

## Prompt Template

```
Adapt this post for r/{subreddit_name}.
Tone should match the community:
- Technical depth appropriate (e.g., r/reactjs = technical, r/startups = business)
- Adjust examples and references
- Match the call-to-action style
Original: {master_body}
Adapted version:
```

## Files

- `src-tauri/src/llm/openai.rs` — `adapt_for_subreddit()` method (to add)
- `src-tauri/src/lib.rs` — `adapt_cross_post` command (to add)
- `src/components/CrossPostPanel.tsx` — AI Adapt button

## Verification

- [ ] AI Adapt produces community-appropriate rewrite
- [ ] User can edit AI-adapted text
- [ ] Copy from Master available after adapt
