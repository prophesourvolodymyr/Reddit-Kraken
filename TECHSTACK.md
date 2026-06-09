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
| LLM (V1) | OpenAI |
| LLM (future) | 21+ providers via pluggable interface |
| Embeddings | Local fastembed-rs (all-MiniLM-L6-v2) |
| Reddit API | OAuth via Script app type |
| Post storage | SQLite, dedup by Reddit post_id |
| Polling schedule | Every 15min per sub (configurable) |
| Scheduler | Rust tokio cron |
| Mobile | Tauri iOS (post-desktop) |
