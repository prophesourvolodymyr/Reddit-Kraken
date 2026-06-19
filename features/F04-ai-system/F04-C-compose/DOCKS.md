# F04-C — Reply Generation

AI drafts Reddit replies based on post content and user's writing style. User can accept, edit, or regenerate. Multiple tone options.

## Architecture (To Wire)

```
PostDetail → "Suggest Reply" button
│
suggest_reply(post, user_context) → LlmProvider::suggest_reply(prompt)
│
Prompt template:
  "You suggest thoughtful Reddit replies. Be concise, helpful, authentic.
   Max 3 paragraphs.
   
   Post: {title} — {body}
   I want to respond as someone who: {user_expertise/context}
   
   Draft a reply that adds value:"
│
Response → display in reply textarea, user can edit before posting
```

## Tone Options

| Tone | Description |
|------|-------------|
| Helpful | Answer questions, provide solutions |
| Insightful | Add perspective, share experience |
| Supportive | Encourage, validate, build up |
| Challenging | Respectfully disagree, debate |
| Casual | Friendly, conversational |

## Files

- `src-tauri/src/llm/openai.rs:56-73` — `suggest_reply` implementation
- `src/components/PostDetail.tsx` — reply textarea, needs "Suggest" button
- `src/components/AIRespondView.tsx` — Reply/Dismiss actions

## Verification

- [ ] Click "Suggest Reply" → AI generates draft in textarea
- [ ] User can edit AI draft before posting
- [ ] Multiple tone options produce different outputs
- [ ] Regenerate gives new draft
