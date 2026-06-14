# TECHSTACK

| Layer | Technology |
|-------|-----------|
| Desktop framework | Tauri |
| Backend language | Rust |
| Frontend framework | React |
| UI library | shadcn/ui |
| Styling | Black & white minimalistic |
| Font: Titles | Inter Bold 18px |
| Font: Body | Inter (regular) |
| Database | SQLite |
| LLM (V1) | OpenAI (GPT-4o-mini) |
| LLM (future) | 21+ providers via pluggable `LlmProvider` trait |
| LLM tasks | Binary evaluation ("worth responding?"), reply suggestion, text enhance |
| Reddit API | OAuth via Script app type |
| Post storage | SQLite, dedup by Reddit post_id |
| Polling schedule | Every 15min per sub (configurable), activity every 5min |
| Scheduler | Rust tokio cron |
| Cross-post scheduling | tokio cron + delayed dispatch queue |
| Local API | Embedded HTTP server (loopback-only, tokio + hyper/axum) |
| Mobile | Tauri iOS (post-desktop) |
