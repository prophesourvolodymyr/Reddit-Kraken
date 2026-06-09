# F8 — LLM Providers

## Overview
Abstract provider interface so user can switch between OpenAI, Anthropic, local models, and 20+ others via a unified config.

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
│    fn analyze_post(&self, prompt)    │
│      -> Result<Analysis>;            │
│    fn suggest_reply(&self, prompt)   │
│      -> Result<String>;              │
│    fn enhance_text(&self, prompt)    │
│      -> Result<String>;              │
│    fn embed(&self, text)             │
│      -> Result<Vec<f32>>;            │
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
    async fn chat(&self, messages: Vec<ChatMessage>) -> Result<String>;
    async fn analyze_post(&self, post: &Post, profile: &Profile) -> Result<Analysis>;
    async fn suggest_reply(&self, post: &Post, context: &str) -> Result<Vec<String>>;
    async fn enhance(&self, draft: &str, mode: EnhanceMode) -> Result<String>;
}

pub enum EnhanceMode {
    Enhance,
    Rewrite,
    FixGrammar,
    Expand,
}

pub struct ChatMessage {
    pub role: String,  // "system" | "user" | "assistant"
    pub content: String,
}
```

## Provider Storage

```rust
struct ProviderConfig {
    id: String,
    name: String,
    api_base: String,
    api_key: String,         // encrypted
    model: String,
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
- **API keys**: Encrypted at rest in SQLite (OS-level encryption or keyring)
- **Fallback**: If primary provider fails, try secondary
- **Cost tracking**: Log token usage per provider per session
- **Model config**: Each provider can have different model per task (e.g., GPT-4o-mini for analysis, GPT-4o for composing)
- **Local models**: Ollama requires the user to have it running separately
