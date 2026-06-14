# F8 — LLM Providers

## Overview
Abstract provider interface so user can switch between OpenAI, Anthropic, local models, and 20+ others via a unified config. Simplified trait — only the calls the app actually needs.

## Architecture

```
┌──────────────────────────────────────┐
│  User selects provider in Settings   │
│  + enters API key                    │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Provider trait (Rust)               │
│                                      │
│  trait LlmProvider {                 │
│    fn evaluate_post(&self, prompt)   │
│      -> Result<Evaluation>;          │
│    fn suggest_reply(&self, prompt)   │
│      -> Result<String>;              │
│    fn enhance_text(&self, prompt)    │
│      -> Result<String>;              │
│  }                                   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  Implementations:                                 │
│  • OpenAiProvider    → api.openai.com             │
│  • AnthropicProvider → api.anthropic.com          │
│  • OllamaProvider    → localhost:11434            │
│  • ...                → any OpenAI-compatible API │
└──────────────────────────────────────────────────┘
```

## Provider Interface (Rust)

```rust
#[async_trait]
pub trait LlmProvider: Send + Sync {
    /// Evaluate if a post is worth responding to
    async fn evaluate_post(&self, prompt: &str) -> Result<Evaluation>;

    /// Suggest a reply for a given post/message
    async fn suggest_reply(&self, prompt: &str) -> Result<String>;

    /// Enhance / rewrite / fix grammar for a draft text
    async fn enhance_text(&self, draft: &str, mode: EnhanceMode) -> Result<String>;
}

pub struct Evaluation {
    pub worth_responding: bool,
    pub reason: String,
}

pub enum EnhanceMode {
    Enhance,
    Rewrite,
    FixGrammar,
    Expand,
}
```

## What Changed From V1
- **Removed**: `embed()` method (no more local embeddings)
- **Removed**: `analyze_post()` with complex Analysis struct (0-10 scores, urgency, etc.)
- **Simplified**: `evaluate_post()` returns simple `{worth_responding: bool, reason: string}`
- **Kept**: `suggest_reply()`, `enhance_text()` — core AI assistance for composing

## Provider Storage

```rust
struct ProviderConfig {
    id: String,
    name: String,
    api_base: String,
    api_key: String,         // encrypted at rest
    model: String,           // default: gpt-4o-mini
    enabled: bool,
}
```

## Supported Providers (V1+)

| Provider | Type | Cost |
|----------|------|------|
| OpenAI | Cloud API | Pay per token |
| Anthropic | Cloud API | Pay per token |
| Ollama | Local (free) | Free, requires GPU |
| LM Studio | Local (free) | Free, requires GPU |
| Together AI | Cloud API | Pay per token |
| Groq | Cloud API | Free tier available |
| OpenRouter | Aggregator | Varies |

Any OpenAI-compatible API works via the same interface.

## Nuances
- **V1**: Only OpenAI implemented. Others = drop-in once trait is stable
- **API keys**: Encrypted at rest in SQLite
- **Fallback**: If primary provider fails, try secondary
- **Cost tracking**: Log token usage per provider per session
- **Model config**: GPT-4o-mini default, user can override per provider
- **Local models**: Ollama requires user to run it separately
