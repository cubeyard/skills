---
name: how
description: "Use for \"how does X work\", code walkthroughs before changing something, and placement / ownership / layering questions (\"where should this live\", \"which package owns this\", \"is this the right layer\"). Explains subsystem architecture, runtime flow, onboarding mental models. Use why for motivation."
disable-model-invocation: true
---

# How

Explore the codebase to answer "how does X work?" questions. Produce architectural explanations at the level of a senior engineer onboarding onto a subsystem, enough to build a working mental model, not so much that it reads like annotated source code.

<!-- cube-adapt M2 M4. Intent: explorers cover slices in parallel on a fast model, and a separate explainer on a judgment model writes from their findings, so exploring and explaining stay apart. Cube: a thread cannot spawn; OptChat can, and picks each thread's model from the role lines. Kept: the explorer/explainer split, the angles, the templates and the output shape. Now: a thread runs the roles in order with files between them; OptChat runs them as read-only threads. Cost: in a thread, one model plays both roles and the angles run one after another. -->
**In a thread** (no spawns), run the same roles yourself, in order: each explorer angle as its own pass that writes its findings, in the explorer template's shape, to a scratch file (`/tmp/how-<slug>/angle-<n>.md`); then the explainer pass, which reads those files, not your memory of the code. Leave out the templates' lines about other agents. **In OptChat**, each explorer and the explainer is a thread: spawn the explorers in one call, read only (no edits, no branch), each with the explorer template and its angle; when they report, spawn the explainer with every report pasted in full. Models come from the `how explorer` and `how explainer` role lines.

## 1. Assess complexity

If the scope is ambiguous, state your interpretation and explore. The user can redirect.

<!-- cube-adapt M2. Intent: a simple question needs one pass. Cube: the pass is yours in a thread, a thread in OptChat. Kept: one pass. Now: the words. Cost: none. -->
- **Simple** (a single module, a small utility, a narrow question such as "how does function X work"): no explorers. Run one explainer pass (a thread: yourself; OptChat: one thread) that explores and explains in one pass, built from `references/explainer-prompt.md` without the explorer-findings section. Go to step 4.
- **Complex** (a subsystem spanning multiple files or services, a cross-cutting feature, a full architectural overview): go to step 2.

When in doubt, take the simple path.

## 2. Explore (complex only)

<!-- cube-adapt M2. Intent: explorers start together. Cube: only OptChat spawns. Kept: 2 to 4 angles, one template each. Now: OptChat spawns them in one call; a thread runs them as passes. Cost: none. -->
Decompose the question into 2 to 4 angles, each a distinct slice of the subsystem. Run one explorer per angle with `references/explorer-prompt.md` and its angle filled in: OptChat spawns them all in one call; a thread runs them one pass at a time.

## 3. Synthesize (complex only)

<!-- cube-adapt M2. Intent: the explainer sees every explorer's findings. Cube: files carry them in a thread; pasted reports in OptChat. Kept: all findings, one explainer. Now: as written. Cost: none. -->
Once all explorers have finished, run one explainer with `references/explainer-prompt.md` and every explorer's findings filled in (a thread: from the angle files; OptChat: a thread with every report pasted).

## 4. Present

Present the explainer's output. Light edits for clarity or context from the conversation are fine. Do not substantially rewrite it.

## Output format

The explanation uses the sections defined in `references/explainer-prompt.md`, dropping any that do not apply: Overview, Key Concepts, How It Works, Where Things Live, Gotchas.
