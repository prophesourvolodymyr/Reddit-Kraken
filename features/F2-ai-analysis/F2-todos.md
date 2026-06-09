# F2 TODOs

## Embeddings
- [ ] Integrate fastembed-rs in Rust
- [ ] Load all-MiniLM-L6-v2 model at startup
- [ ] Generate embedding for user profile
- [ ] Generate embedding for each new post
- [ ] Cosine similarity comparison
- [ ] Pre-filter posts below similarity threshold

## LLM Analysis
- [ ] OpenAI client in Rust (reqwest)
- [ ] Build prompt template: post + profile + sub prompt + comments
- [ ] Parse structured JSON response
- [ ] Handle malformed/empty LLM responses
- [ ] Retry logic for LLM failures
- [ ] Batch multiple posts in one LLM call

## Interest Profile
- [ ] UI for writing/editing free-form profile
- [ ] UI for per-sub prompts
- [ ] Store in SQLite user_profile table
- [ ] Re-embed when profile changes

## Scoring & Status
- [ ] Implement score 1-10 system
- [ ] Implement status transitions
- [ ] Auto-set urgency based on score
- [ ] Store analysis JSON on post
- [ ] Highlight critical posts (score 9-10)

## Rust Modules
- [ ] `analysis.rs` — pipeline orchestrator
- [ ] `embeddings.rs` — fastembed wrapper
- [ ] `llm.rs` — OpenAI client
- [ ] `profile.rs` — interest profile CRUD
