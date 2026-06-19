# F04-A — Provider Management

Add, configure, test, and switch between LLM providers. OpenAI-compatible API (works with OpenAI, Anthropic proxies, local models). API keys encrypted with AES-256-GCM before storage. Token usage tracking.

## Architecture

```
SettingsPanel → LLM Providers tab
│
├── list_llm_providers() → SELECT FROM provider_configs
├── save_llm_provider_config(input)
│   └── encrypt_api_key(api_key) → INSERT OR UPDATE provider_configs
├── set_active_llm_provider(provider_id)
│   └── UPDATE all to is_active=0 → UPDATE selected to is_active=1
└── test_llm_provider(provider_id)
    └── decrypt_api_key → POST {api_base}/chat/completions
    └── "Say 'connection successful' in one short sentence."
    └── Update last_tested_at, last_test_ok, token counters
```

## DB Schema

```sql
CREATE TABLE provider_configs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider_kind TEXT DEFAULT 'openai',
    api_base TEXT NOT NULL,
    model TEXT DEFAULT 'gpt-4o-mini',
    enabled INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 0,
    encrypted_api_key TEXT,
    created_at TEXT, updated_at TEXT,
    last_tested_at TEXT, last_test_ok INTEGER, last_test_error TEXT,
    total_prompt_tokens INTEGER, total_completion_tokens INTEGER, total_tokens INTEGER
);
```

## Current State

- Provider CRUD fully built and wired
- API key encryption works
- Test connection works
- Set active provider works
- Token usage tracked

## Files

- `src-tauri/src/lib.rs:510-721` — `list_llm_providers`, `save_llm_provider_config`, `set_active_llm_provider`, `test_llm_provider`
- `src-tauri/src/lib.rs:449-508` — `LlmProviderConfig`, `SaveLlmProviderConfigInput`, `LlmProviderTestResult`
- `src-tauri/src/llm/openai.rs` — `OpenAiProvider` struct, `chat_completion`
- `src/components/SettingsPanel.tsx` — LLM Providers tab

## Verification

- [ ] Add provider → appears in list
- [ ] Test connection → shows "Connection OK" or error
- [ ] Set active → badge shows on provider
- [ ] API key encrypted in SQLite
- [ ] Token counts increment after usage
