# F8 TODOs

## Provider Trait
- [ ] Define `LlmProvider` trait in Rust
- [ ] Define `ChatMessage`, `Analysis`, `EnhanceMode` types
- [ ] Error handling for provider failures

## OpenAI Provider
- [ ] Implement `LlmProvider` for OpenAI
- [ ] Configurable model (default: gpt-4o-mini)
- [ ] Configurable API base (for proxies)
- [ ] Token usage tracking

## Provider Config
- [ ] SQLite table for provider configs
- [ ] Settings UI to add/edit providers
- [ ] API key encryption at rest
- [ ] Provider selector (which is active)
- [ ] Test connection button

## V2+ Providers (later cycles)
- [ ] Anthropic provider
- [ ] Ollama provider
- [ ] OpenRouter provider
- [ ] Model-per-task configuration
