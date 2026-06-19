# F04 — AI System

LLM-powered analysis pipeline. Users configure OpenAI-compatible providers, then the AI evaluates posts for "worth responding", generates reply drafts, and enhances text. All API keys encrypted. All prompts run locally through the user's chosen provider.

## Architecture

```
┌──────────────────────────────────────────────────┐
│  User configures provider in Settings             │
│  ├── name, api_base, model, api_key               │
│  └── Test Connection → encrypt + store            │
│                                                   │
│  AI Pipeline (background, per-post):              │
│  1. Fetch fresh posts                             │
│  2. For each unseen post:                         │
│     └── evaluate_post(post) → worth_responding?   │
│         └── System prompt: "Analyze this Reddit   │
│              post. Is it worth responding to?"    │
│         └── Returns {worth_responding, reason}    │
│  3. Update post in DB: worth_responding=1,        │
│     ai_reason="They're asking about..."           │
│                                                   │
│  On-demand tools:                                 │
│  ├── suggest_reply(post, my_voice) → draft reply  │
│  └── enhance_text(draft, mode) → improved text    │
└──────────────────────────────────────────────────┘
```

## Sub-Features

| Code | Name | Status |
|------|------|--------|
| F04-A | Provider Management | `in_progress` |
| F04-B | Post Evaluation | `pending` |
| F04-C | Reply Generation | `pending` |
| F04-D | Text Enhance | `pending` |

## Dependencies

- F01 — need Reddit connected to fetch posts
- F02-A — posts must be in DB for evaluation

## Files

- `src-tauri/src/llm/mod.rs` — `LlmProvider` trait
- `src-tauri/src/llm/openai.rs` — `OpenAiProvider` implementation
- `src-tauri/src/lib.rs:510-721` — LLM provider CRUD commands
- `src/components/SettingsPanel.tsx` — LLM Providers tab
- `src/components/AIRespondView.tsx` — worth-responding post view (standalone)
