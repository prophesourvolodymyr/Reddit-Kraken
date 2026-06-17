# Phase 1 of F2 — AI Evaluation Pipeline

## Context
Wire up the end-to-end AI evaluation pipeline. LLM trait and OpenAI provider exist from Phase 1. Now connect them to real posts — fetch unseen posts, evaluate via LLM, flag `worth_responding`, track what user has seen.

## What You Need to Read First
- `features/F2-ai-analysis/F2-docs.md` — full pipeline, prompt template, app memory rules
- `features/F2-ai-analysis/F2-todos.md` — task checklist
- `src-tauri/src/llm/mod.rs` — LlmProvider trait definition
- `src-tauri/src/llm/openai.rs` — OpenAI implementation
- `src-tauri/src/db.rs` — current schema (posts table with worth_responding, ai_reason, seen columns)
- `src-tauri/src/lib.rs` — existing Tauri commands pattern
- `src/components/AIRespondView.tsx` — current stub, needs wiring

## Codebase Learnings
- Posts stored in SQLite with `worth_responding INTEGER DEFAULT 0`, `ai_reason TEXT`, `seen INTEGER DEFAULT 0`
- Existing `get_worth_responding_posts()` and `dismiss_post()` Tauri commands in lib.rs
- Existing `list_llm_providers` / `save_llm_provider_config` commands — provider config is stored and retrievable
- `OpenAiProvider::evaluate_post()` expects a prompt string, returns `Evaluation { worth_responding: bool, reason: String }`
- Tauri commands are synchronous (use `Mutex` for db) — LLM calls need `tokio::runtime::Handle::current().block_on()`
- API keys encrypted via `encrypt_api_key()` / `decrypt_api_key()` in lib.rs

## What to Build
- Task 1: Add `user_profile` and `sub_prompts` tables to db.rs schema
- Task 2: Rust `evaluation.rs` module — orchestrates: fetch unseen posts → build prompt → call LLM → update post
- Task 3: Tauri commands: `get_user_profile`, `save_user_profile`, `get_sub_prompts`, `save_sub_prompt`, `evaluate_posts`
- Task 4: React profile editor — Settings section or dedicated view for free-form interest profile textarea
- Task 5: React per-sub prompts editor — textarea per subscribed subreddit
- Task 6: Wire AIRespondView to `get_worth_responding_posts()` — show real posts from DB with [Reply] [Dismiss] [Save] actions
- Task 7: App memory — `mark_seen` on scroll (IntersectionObserver in PostList) and on PostDetail open
- Task 8: Rust `mark_seen_batch` command for bulk marking seen posts

## Files to Create/Modify
- create: `src-tauri/src/evaluation.rs`
- modify: `src-tauri/src/db.rs` — add user_profile + sub_prompts tables
- modify: `src-tauri/src/lib.rs` — add new Tauri commands + register them
- create: `src/components/ProfileEditor.tsx`
- modify: `src/components/SettingsPanel.tsx` — add Interest Profile tab
- modify: `src/components/AIRespondView.tsx` — wire to real data + actions
- modify: `src/components/PostList.tsx` — add IntersectionObserver for mark_seen
- modify: `src/components/PostDetail.tsx` — call mark_seen on open
- modify: `src/types.ts` — add profile types if needed

## Verification
- [ ] `cargo check` — no errors
- [ ] `npm run build` — no errors
- [ ] Evaluation pipeline: `evaluate_posts` command runs, flags posts with worth_responding=1
- [ ] Profile save/load works via Tauri commands
- [ ] AIRespondView shows posts from DB (or empty state if none)
- [ ] Dismiss button sets worth_responding=0, seen=1
- [ ] Reply button shows inline textarea with AI suggestion (call `suggest_reply`)
- [ ] Scroll marks posts as seen (IntersectionObserver fires mark_seen_batch)
- [ ] No crash with empty profile or no LLM provider configured

## When You Finish
Report what was built, what was verified, and any issues found. Mark tasks in `features/F2-ai-analysis/F2-todos.md` and `CYCLES.md`.
