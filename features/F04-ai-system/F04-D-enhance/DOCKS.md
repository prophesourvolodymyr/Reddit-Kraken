# F04-D — Text Enhance

AI improves draft text. Four modes: enhance (clarity + impact), rewrite (from scratch), fix grammar, expand (add detail). Used in cross-post editor, reply composer, and post creator.

## Architecture (To Wire)

```
User selects text → chooses enhance mode
│
enhance_text(draft, mode) → LlmProvider::enhance_text(draft, mode)
│
Mode prompts:
  Enhance: "Improve clarity and impact while keeping my voice"
  Rewrite: "Rewrite this from scratch preserving the core message"
  FixGrammar: "Fix grammar and spelling only. Don't change meaning"
  Expand: "Add more detail, examples, and depth"
│
Response → replace selection or append
```

## UI Integration

| Location | Usage |
|----------|-------|
| NewPostModal | Body text → AI buttons |
| PostDetail reply | Reply text → AI buttons |
| Cross-post editor | Per-panel body → AI Adapt + Enhance buttons |
| Cross-post master | Master body → AI buttons |

## Files

- `src-tauri/src/llm/openai.rs:75-87` — `enhance_text` implementation
- `src-tauri/src/llm/mod.rs:11-15` — `EnhanceMode` enum
- `src/components/NewPostModal.tsx` — needs AI buttons
- `src/components/PostDetail.tsx` — needs AI buttons

## Verification

- [ ] Enhance improves clarity without changing meaning
- [ ] Rewrite produces fresh version
- [ ] FixGrammar only corrects errors
- [ ] Expand adds meaningful detail
- [ ] Each mode responds within 5 seconds
