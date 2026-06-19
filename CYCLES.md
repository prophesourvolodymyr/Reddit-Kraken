# CYCLES.md — Reddit-Kraken

## Cycle 0 — Documentation Reorganization
- [x] New feature structure (F01–F10 with sub-features)
- [x] All 48 DOCKS.md files written
- [x] Old docs archived to `features/_archive/`
- [x] Root index `features/DOCKS.md` updated
- [x] CYCLES.md rewritten
- [x] AGENTS.md updated

## Cycle 1 — F01 Authentication + F02 Data Pipeline (Fix Broken)
- [ ] F01 — Authentication
  - [ ] F01-A Token Input — login form working, needs token persistence verification
  - [ ] F01-B Persistence — encrypted storage + auto-restore (built, needs testing)
  - [ ] F01-C Session Refresh — auto-refresh via reddit_session (built, needs testing)
- [ ] F02 — Reddit Data Pipeline
  - [ ] F02-A Post Fetching — real-time on click + scheduler (built, needs fixing)
  - [ ] F02-B Comment Fetching — threaded comments on post open (built, needs testing)
  - [ ] F02-C Subreddit Metadata — icons, colors, import subscriptions (built, needs icon fix)
  - [ ] F02-D Content Submission — posting + commenting (NOT BUILT)
  - [ ] F02-E Notifications — inbox + activity (NOT BUILT)

## Cycle 2 — F03 For You Feed + F06-C Color System + F06-D Tabs
- [ ] F03 — For You Feed
  - [ ] F03-A Scoring Engine — engagement + freshness algorithm
  - [ ] F03-B Feed Composition — sort, dedup, paginate
- [ ] F06-C Color System — extract dominant color from sub icon
- [ ] F06-D Tab Navigation — fix General/For You behavior

## Cycle 3 — F04 AI System
- [ ] F04-A Provider Management — already built, needs verification
- [ ] F04-B Post Evaluation — wire AI evaluation into post pipeline
- [ ] F04-C Reply Generation — AI-drafted replies
- [ ] F04-D Text Enhance — grammar/rewrite/expand

## Cycle 4 — F05 Cross-Posting
- [ ] F05-A Editor — master + per-community panels
- [ ] F05-B AI Adapt — per-community content adaptation
- [ ] F05-C Scheduling — per-sub timing + queue
- [ ] F05-D Drafts — auto-save + recovery
- [ ] F05-E Posting — sequential submit + progress

## Cycle 5 — F06 UI Shell Polish
- [ ] F06-A Sidebar — icon loading, color integration, badge computation
- [ ] F06-B Post Views — image loading, card/compact polish

## Cycle 6 — F07 + F08 + F09 + F10 Remaining
- [ ] F07 — Filter & Search
- [ ] F08 — Activity Center
- [ ] F09 — Saved Folders
- [ ] F10 — Local API
