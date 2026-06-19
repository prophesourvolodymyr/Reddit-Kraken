# Phase 6 of F04 — Wire AI Post Evaluation

## Context
LLM providers are already configured and testable. Now wire the AI evaluation pipeline: after scheduler fetches posts, run each through the LLM to determine "worth responding". Store results. Display in PostCard and AIRespondView.

## What You Need to Read First
- `features/F04-ai-system/DOCKS.md`
- `features/F04-ai-system/F04-B-evaluation/DOCKS.md`
- `src-tauri/src/llm/mod.rs` — LlmProvider trait
- `src-tauri/src/llm/openai.rs` — evaluate_post implementation
- `src-tauri/src/scheduler.rs` — poll_sub (insertion point for AI eval)
- `src/components/AIRespondView.tsx` — worth-responding list (standalone)

## What to Build
- Task 1: After scheduler stores new posts, run AI evaluation on each
- Task 2: Load active LLM provider from DB, decrypt key, create provider
- Task 3: Call `evaluate_post()` for each new post, store result in DB
- Task 4: Wire AIRespondView into App.tsx (currently standalone)
- Task 5: Add "Worth Responding" filter view accessible from TopBar

## Files to Create/Modify
- modify: `src-tauri/src/scheduler.rs` — add AI evaluation after store_posts
- modify: `src-tauri/src/lib.rs` — load active provider for evaluation
- modify: `src/App.tsx` — add AIRespondView route
- modify: `src/components/TopBar.tsx` — add "Worth Responding" button

## Verification
- [ ] Configure LLM provider → test connection works
- [ ] Scheduler fetches posts → AI evaluates → worth_responding flags set in DB
- [ ] AIRespondView shows flagged posts with reasons
- [ ] Dismiss removes from list
- [ ] No crash if no LLM provider configured (graceful skip)
