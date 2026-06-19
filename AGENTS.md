# AGENTS.md — AI Project Management System

## 1. Bootstrap — What AI Does First

When opening this project, determine which state the project is in:

### State A: Empty repo — no `features/`, no `CYCLES.md`
1. Read everything in `genesis/`
2. Read any external reference projects included
3. Read `STYLES.md` if present (design conventions)
4. Ask user: "What should be Feature 01?"
5. Create `features/DOCKS.md` index + F01 DOCKS.md
6. Create `CYCLES.md` with Cycle 1
7. Run AUDIT for F01, then implement

### State B: Has `genesis/` + `STYLES.md` but no `features/`
1. Read everything in `genesis/`
2. Read `STYLES.md`
3. Read all dependency/reference code
4. Propose feature breakdown to user (all F01–FNN)
5. Create all DOCKS.md files + `features/DOCKS.md` index
6. Create `CYCLES.md`
7. Run AUDIT for F01, then implement

### State C: Has `features/`, `CYCLES.md`, active feature docs
1. Read `features/DOCKS.md` — understand full project map
2. Read `CYCLES.md` — find current active cycle
3. Read the active feature's DOCKS.md + all its dependency DOCKS.md files
4. Ask user: "Continue Cycle N for FXX?" or "Start next feature?"
5. If starting: run AUDIT Protocol for that feature
6. If continuing: pick up from last verified phase

---

## 2. Project Identity

### File Structure
```
Project/
├── AGENTS.md              ← this file (the system)
├── CYCLES.md              ← development cycle tracking
├── STYLES.md              ← design system conventions (optional)
├── genesis/               ← origin docs, never modify after creation
│   ├── ORIGINAL IDEA.md   ← what we're building and why
│   └── REFERENCE/         ← images, links, research
├── features/              ← all feature documentation
│   ├── DOCKS.md           ← root index of every feature
│   ├── F01-name/          ← feature folder
│   │   ├── DOCKS.md       ← what it is, what it owns, verification
│   │   ├── F01-AUDIT.md   ← optional, pre-build audit output
│   │   ├── F01-A-sub/     ← sub-feature (alphabetical nesting)
│   │   │   └── DOCKS.md
│   │   └── F01-B-sub/
│   │       └── DOCKS.md
│   ├── F02-name/
│   └── _archive/          ← old docs, reference only, never build from
└── prompts/               ← multi-agent phase prompts
    └── F01-phase-1.md
```

### Feature Folder Rules
- Every feature gets a numbered folder: `FNN-lowercase-with-dashes`
- Every feature gets a `DOCKS.md`
- Sub-features nest inside with alphabetical codes: `FNN-A-sub-name/`
- Audit files are OPTIONAL — only for features with significant unknowns
- Archives: old docs go to `_archive/`, never built from

### DOCKS.md Template
```markdown
# FNN — Feature Name

Brief description.

## What We Build
Concrete deliverables. No ambiguity.

## Architecture
Component diagram or view hierarchy.

## States (if applicable)
| State | Size | Style | Content |
|---|---|---|---|

## Animation Rules (if applicable)
| Animation | mass | stiffness | damping |
|---|---|---|---|

## Files
- `path/File.ext` — what it does

## Dependencies
- FXX — must be verified before this starts

## Verification
- [ ] device test checklist
```

---

## 3. The Feature System

### Linear Build Order

Every feature is numbered F01, F02, etc. Features are built in strict linear order:

```
F01 → F02 → F03 → F04 → F05 → F06 → F07 → F08
                                              │
                                   ┌──────────┘
                                   ▼
                   F09 → F10 → F11 → F12
```

Later features branch into parallelizable groups that don't block each other. But the core chain (F01→...→F08) is sequential — each feature depends on the ones before it.

You cannot start a feature until the ones it depends on pass verification.

### Feature DOCKS.md Is the Source of Truth

## 3. The Feature System

### Linear Build Order

Every feature is numbered F01, F02, etc. Features are built in strict linear order:

```
F01 → F02 → F03 → F04 → F05 → F06 → F07 → F08
                                              │
                                   ┌──────────┘
                                   ▼
                   F09 → F10 → F11 → F12
```

Later features branch into parallelizable groups that don't block each other. But the core chain (F01→...→F08) is sequential — each feature depends on the ones before it.

You cannot start a feature until the ones it depends on pass verification.

### Feature DOCKS.md Is the Source of Truth

Every visual or functional piece of the project has a DOCKS.md. This document defines:
- **What**: exact deliverables
- **Architecture**: component tree, data flow
- **States**: all visual states the component can be in
- **Animations**: exact spring parameters
- **Files**: every file to create/modify
- **Verification**: checklist of testable items on target device

Code follows the doc. If something isn't in the DOCKS.md, it doesn't get built.

### Build → Test → Connect (Step by Step)

Don't build everything at once. Build each feature in isolation, verify it, THEN connect it to the next one.

```
DOCKS.md  →  AUDIT  →  BUILD  →  DEPLOY  →  TEST  →  VERIFIED
                                                         │
                                              ┌──────────┘
                                              ▼
                                         CONNECT to next feature
```

**Phase 1 — Paper first.** Write the DOCKS.md for the feature. Define exactly what gets built, what files, what it depends on. No code.

**Phase 2 — Audit the unknowns.** Run the 7-step AUDIT before touching code. Resolve every design question. Know exactly how it works before building.

**Phase 3 — Build in isolation.** Write only the code for this one feature. Don't add voice mode if the feature is glass. Don't add Siri if the feature is a notch. Keep it self-contained.

**Phase 4 — Deploy and test.** Build the .deb, install on device, check it works. Every checkbox in the DOCKS.md must pass. Nothing ships untested.

**Phase 5 — Verify, then connect.** Only after the feature passes on device, connect it to the next feature. Connecting two broken pieces doesn't fix either one. Connect two verified pieces and you get a verified system.

**Why this works:**
- You always know what's broken — the feature you're building, not the whole system
- Debugging is fast — one feature, few files, clear boundaries
- Motivation stays high — each feature completes and visibly works
- No backtracking — a verified feature stays verified; you build forward, never redo

Each cycle groups one feature (or a group of parallel features). Features leave a cycle only when all verification items pass. CYCLES.md uses a compact checkbox-tree format:

```markdown
# CYCLES.md — Project Name

## Cycle 0 — Documentation
- [x] Project structure + all DOCKS.md files
- [x] CYCLES.md created

## Cycle 1 — First Build
- [x] F00 — Bootstrap
- [ ] F01 — Feature Name
  - [ ] F01-A Sub-feature
  - [ ] F01-B Sub-feature

## Cycle 2 — Next Phase
- [ ] F02 — Another Feature
```

### Cycle 0 — Documentation Reorganization

A special pre-code cycle. Runs ONCE at project start or after a major re-plan:
1. Define all features (F01 through FNN)
2. Write DOCKS.md for each feature
3. Archive old docs to `features/_archive/`
4. Update `features/DOCKS.md` index
5. Update `CYCLES.md` with all cycles
6. Update `AGENTS.md`

No code is written in Cycle 0. Only documentation.

---

## 5. The AUDIT Protocol

Run BEFORE writing any code for a feature. Turns exploration into specification so implementation is mechanical, not experimental.

### Step 1 — Read Everything
The feature's DOCKS.md. All dependency feature DOCKS.md files. External references. STYLES.md. genesis/ docs.

### Step 2 — Confirm Understanding
Write a 3-line summary. User confirms it before proceeding.

### Step 3 — 10 Questions, Debate Format
Ask 10 sharp questions. Each must challenge an assumption or expose a gap. Debate until concrete. Examples:
- "What happens if X happens during Y animation?"
- "How does this survive an edge case like Z?"
- "What's the fallback if W fails?"

### Step 4 — Extract the UX Vision
Describe exactly what the user sees and does. Every state, every transition. Pure experience, no implementation. Example:
```
1. User sees a small pill at top center
2. User taps it → expands with spring animation to 320×190pt
3. Inside: content appears
4. Tap outside → shrinks back
```

### Step 5 — Diagrams
ASCII diagrams for state machine, animation timeline, component hierarchy, data flow.

### Step 6 — 4 AI-Approved Additions
Propose 4 improvements the user didn't ask for. They accept, reject, or modify each one.

### Step 7 — Confirm and Build
User confirms audit. Write `FNN-AUDIT.md`. Then implement.

### When to Skip the Audit
- Bug fixes (no unknowns)
- Small refactors (no new design decisions)
- Simple sub-features fully specified in DOCKS.md

---

## 6. Agent Behavior Rules

### Always
- Read all relevant DOCKS.md before any code
- Verify on device, not just compile
- Use existing patterns from the codebase
- Follow STYLES.md conventions
- Test on target hardware before closing any feature

### Never
- Hardcode positions or dimensions
- Mix languages where not allowed (e.g. no Swift in Theos .x files)
- Use wrong animation types (e.g. no UIView.animate when CASpringAnimation is the standard)
- Create custom windows when injection is the pattern
- Add comments unless explicitly asked
- Commit secrets or keys
- Create .md files outside features/, genesis/, or root

### When Stuck
- Check reference code for patterns
- Verify with compiler
- Read genesis/ docs for original intent
- Ask user before making architecture choices
- Never guess — if DOCKS.md doesn't say, ask

---

## 7. Status Vocabulary

| Term | Meaning |
|---|---|
| `pending` | Not started, waiting for dependency completion |
| `in_progress` | Currently being built |
| `blocked` | Can't continue — needs user decision or dependency |
| `ready_for_review` | Code written, needs device verification |
| `verified` | Tested on target hardware, works correctly |
| `done` | Complete, closed, no further work |

---

## 8. Prompt Chaining for Multi-Agent Work

For features too big for one session, break into sequential phases. Each phase = one prompt file.

### File Location
```
prompts/
  F01-phase-1-description.md
  F01-phase-2-description.md
```

### Naming
`{feature-code}-phase-{N}-{short-title}.md`

### Prompt Format (Every Phase Must Follow)
```markdown
# Phase {N} of {FeatureCode} — {Short Title}

## Context
What we are building and why. 3 lines max.

## What You Need to Read First
- features/FXX-xxx/DOCKS.md
- path/to/existing/file.ext (line X-Y)

## Codebase Learnings
Relevant patterns from existing code.

## What to Build
- Task 1: description
- Task 2: description

## Files to Create/Modify
- create: path/to/new/file.ext
- modify: path/to/existing/file.ext

## Verification
- [ ] compiles without errors
- [ ] deploys to target
- [ ] visible behavior matches spec
- [ ] no crash

## When You Finish
Report what was built, what was verified, and any issues found.
```

### Rules
- Each phase completable in one session
- Sequential — phase 2 only after phase 1 verified
- No unrelated features combined in one phase
- Every phase ends with device verification

---

## 9. The Revolution Protocol

For major architecture changes affecting multiple features. NOT for adding features, bug fixes, or small refactors.

### Step 1 — User Writes the Revolution Document
```markdown
# Revolution: [Name] — [Colossality Rating]
## Why This Revolution
## What Changes
## Migration Path
## Affected Features
## Architecture Decisions
## Risk Assessment
```

### Step 2 — AI Reads and Understands
Read every affected feature's DOCKS.md. Map all files that will change.

### Step 3 — AI Delivers Impact Assessment

#### Colossality Rating
| Rating | Scope |
|---|---|
| MINOR | Affects one sub-feature |
| MODERATE | Affects one feature |
| MAJOR | Affects 2-3 features |
| COLOSSAL | Affects 4+ features or fundamental architecture |

#### Impact Report
Every changed file. Every deleted file. Every new file.

### Step 4 — Negotiation
User modifies, rejects, or accepts.

### Step 5 — Initialize
Create new folders. Migrate affected DOCKS.md files. Update indexes. Archive old structure.

---

## 10. File Generation Rules

### Never Create
- README files
- CHANGELOG files
- .md files outside features/, genesis/, or root
- Documentation inside source directories

### Always Create
- `features/FNN-name/DOCKS.md` for every feature
- `features/FNN-name/FNN-X-sub/DOCKS.md` for every sub-feature
- Update AGENTS.md / CYCLES.md when adding features
