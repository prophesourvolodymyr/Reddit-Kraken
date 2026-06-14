# F2 TODOs

## LLM Evaluation
- [ ] Build prompt template: post + profile + sub prompt + top comments
- [ ] Parse LLM response: `{worth_responding, reason}`
- [ ] Handle malformed/empty LLM responses
- [ ] Retry logic for LLM failures
- [ ] Batch multiple posts in one LLM call
- [ ] Skip posts where `seen=1` or age > 3 days

## Interest Profile
- [ ] React: UI for writing/editing free-form profile
- [ ] React: UI for per-sub prompts
- [ ] Rust: Store profile + sub prompts in SQLite
- [ ] Re-evaluate unseen posts when profile changes

## App Memory
- [ ] Mark posts as `seen` on scroll/viewport exposure
- [ ] Mark posts as `seen` on post detail open
- [ ] Skip `seen=1` posts in evaluation pipeline
- [ ] Never re-evaluate previously evaluated posts

## Daily Digest
- [ ] Rust: Query worth_responding posts grouped by date + subreddit
- [ ] React: For You Digested view — per-day, per-channel sections
- [ ] React: Toggle between Digested and Normal views

## Rust Modules
- [ ] `evaluation.rs` — LLM pipeline orchestrator
- [ ] `llm.rs` — OpenAI client (batch + single)
- [ ] `profile.rs` — interest profile CRUD
