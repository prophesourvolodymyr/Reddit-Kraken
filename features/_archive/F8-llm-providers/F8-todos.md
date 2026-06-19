# F8 TODOs

## Provider Trait
- [x] Define `LlmProvider` trait in Rust (3 methods: evaluate_post, suggest_reply, enhance_text)
- [x] Define `Evaluation`, `EnhanceMode` types
- [x] Error handling for provider failures

## OpenAI Provider
- [x] Implement `LlmProvider` for OpenAI
- [x] Configurable model (default: gpt-4o-mini)
- [x] Configurable API base (for proxies)
- [x] Token usage tracking

## Provider Config
- [x] SQLite table for provider configs
- [x] Settings UI to add/edit providers
- [x] API key encryption at rest
- [x] Provider selector (which is active)
- [x] Test connection button

## V2+ Providers (later phases)
- [ ] Anthropic provider
- [ ] Ollama provider
- [ ] OpenRouter provider
