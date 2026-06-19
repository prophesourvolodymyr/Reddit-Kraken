# F04-B — Post Evaluation

AI evaluates each fetched post: "Is this worth responding to?" Binary classification with reasoning. Results stored in DB (worth_responding flag + ai_reason text). Powers the For You feed and AIRespondView.

## Architecture (To Wire)

```
Scheduler stores post → trigger evaluation
│
evaluate_post(post) → LlmProvider::evaluate_post(prompt)
│
Prompt template:
  "Analyze this Reddit post and determine if it's worth responding to.
   Post title: {title}
   Post body: {body}
   Subreddit: r/{subreddit}
   Score: {score} | Comments: {num_comments}
   
   Return JSON: {"worth_responding": true/false, "reason": "..."}"
│
Response → parse JSON → UPDATE posts SET worth_responding=1, ai_reason=...
│
AIRespondView:
  └── get_worth_responding_posts() → SELECT WHERE worth_responding=1
```

## States

| State | DB value | UI |
|-------|----------|-----|
| Not evaluated | worth_responding=0, ai_reason=null | Normal post |
| Worth responding | worth_responding=1, ai_reason set | Star badge + reason |
| Not worth | worth_responding=0, ai_reason set | Normal post (hidden) |
| Evaluation failed | same as not evaluated | Normal post |

## Files

- `src-tauri/src/llm/openai.rs:88-107` — `evaluate_post` implementation
- `src-tauri/src/lib.rs:296-327` — `get_worth_responding_posts`
- `src/components/AIRespondView.tsx` — worth-responding list view
- `src/components/PostCard.tsx` — worth-responding badge

## Verification

- [ ] New posts auto-evaluated by AI
- [ ] Worth-responding posts show star badge + reason
- [ ] AIRespondView shows only flagged posts
- [ ] Dismiss removes flag
- [ ] Failed evaluation doesn't crash
