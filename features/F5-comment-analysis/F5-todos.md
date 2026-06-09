# F5 TODOs

## Comment Fetching
- [ ] Fetch comments via GET /comments/{post_id} when post opened
- [ ] Store nested comments in comments table
- [ ] Dedup by comment_id
- [ ] Flatten threads for LLM input

## Comment Analysis
- [ ] Build LLM prompt for comment analysis
- [ ] Parse sentiment, answered status, engagement opportunity
- [ ] Identify best comment to reply to
- [ ] Store analysis on post record

## UI Integration
- [ ] AI Insight card below comments
- [ ] "Best reply target" badge on relevant comment
- [ ] Summary in AIPanel (AI Respond tab)
- [ ] Skip analysis if post is locked or > 7 days

## Rust Modules
- [ ] `comments.rs` — fetch, store, analyze
