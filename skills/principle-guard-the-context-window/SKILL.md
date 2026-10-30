---
name: principle-guard-the-context-window
description: "Apply when context is filling up: large outputs, long files, repeated reads, fan-out planning. Route bulk out of the deciding context (OptChat to threads; a thread to scripts and files); keep summaries in the main context, not raw payloads."
# cube-adapt M2. Intent: bulk goes to helpers, summaries stay. Cube: a thread has no subagents; OptChat's helpers are threads. Kept: summaries in, payloads out. Now: OptChat routes bulk to threads; a thread reduces bulk with scripts and reads the reduction. Cost: a thread's reduction runs in its own budget.
disable-model-invocation: true
---

# Guard the Context Window

**Why:** Context overflow degrades reasoning quality, creates compression artifacts, and halts progress.

**Pattern:**
- **Size phases and cap scope.** Limit files per phase, set turn budgets, account for mechanism costs.
