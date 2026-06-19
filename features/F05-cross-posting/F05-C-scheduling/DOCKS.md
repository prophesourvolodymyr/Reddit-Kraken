# F05-C — Scheduling

Per-community schedule: post now, in X minutes/hours, at specific datetime, or add to queue. Batch schedule inheritance option. Scheduled queue view showing upcoming posts grouped by time slot.

## Schedule Options

- Post now (immediate)
- Post in 30 minutes / 2 hours / 6 hours
- Custom datetime picker
- Add to queue (post when user triggers queue)

## Queue View

```
┌─ Scheduled Queue ──────────────────────────────┐
│  Tomorrow, 9:00 AM                              │
│  ├── "Our API is live" → r/reactjs              │
│  └── "Our API is live" → r/webdev               │
│  Jun 16, 2:00 PM                                │
│  └── "What we learned" → r/startups             │
└──────────────────────────────────────────────────┘
```

## Files

- Create: `src-tauri/src/schedule.rs` — schedule engine (store + execute)
- Create: `src/components/SchedulePicker.tsx` — schedule dropdown per panel
- Create: `src/components/ScheduledQueue.tsx` — queue view
- Modify: `src-tauri/src/db.rs` — `cross_post_items.schedule_at` processing

## Verification

- [ ] Schedule dropdown per community panel
- [ ] Custom datetime picker works
- [ ] Queue shows scheduled posts grouped by time
- [ ] Posts execute at scheduled time
