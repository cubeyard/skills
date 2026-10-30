---
name: arena
# cube-adapt M2. Intent: N candidates at one task. Cube: candidates are threads OptChat starts, or passes in a thread. Kept: the trigger. Now: the description names both. Cost: none.
description: "Run N independent candidates at the same task (threads OptChat starts), pick a base, graft the strongest parts of the losers into it. Use for /arena, 'arena this', 'throw it in the arena', or when one attempt at a non-trivial artifact would lock in the wrong shape."
disable-model-invocation: true
---

# Arena

<!-- cube-adapt M1 M2 M3 M4. Intent: N candidates on different models attempt the same task independently, a judge from another family scores them, and the parent picks a base and grafts. Cube: only OptChat can start candidates and a judge (threads, each its own machine and branch, model from the role lines); OptChat cannot read code, so picking and grafting need a thread; a thread alone cannot make independent candidates. Kept: the same prompt as the contract, a rubric held back from candidates, independent outputs, a cross-family judge, reading every candidate before the pick, grafting by hand, verifying the result. Now: OptChat runs Phases A to C with threads, then gives Phases D to F to one synthesis thread; inside a thread, the in-thread form below. Cost: the in-thread form has one model and no judge, so its pick is self-review and is labeled so. -->
## In cube

- **OptChat runs the arena.** Phase A: frame and write the rubric. Phase B: spawn one thread per candidate in one call, each on its own branch (`arena/<slug>/candidate-<n>`), with the same task. Phase C: spawn one read-only judge thread with the rubric and the candidates' branches by label. Phases D to F need code: spawn one synthesis thread with the rubric, every candidate's report and branch, and the judge's report pasted in full; it picks, grafts, verifies and opens the PR. You never pick from summaries alone.
- **A thread** cannot start candidates. If the brief asks for an arena, the single-agent form is: write at least two structurally distinct candidates yourself, each in its own scratch worktree, without looking back at the earlier ones while writing the next; score each against the rubric; pick, graft and verify. Label the result `self-review, not independent` and say which phases were skipped (the cross-family judge always is). When the pick is a one-way door, end your turn proposing a real arena to OptChat instead.

Open a todolist with one entry per phase (Frame, Fan out, Cross-judge, Pick, Graft, Verify) before launching anything.

## Phase A: Frame

Every candidate gets the same prompt, so the prompt is the contract.

1. State the artifact each candidate is producing.
2. Derive the rubric, 3-6 concrete gradeable criteria for what success looks like on *this* task. It is the picker's tool in Phase D. Candidates only see the task.
<!-- cube-adapt M4. Intent: a diverse panel of runners from the user's configured models. Cube: models are cube model ids from the role lines in OptChat's instructions; Cursor slugs are not valid; `spawn` takes one model per thread. Kept: the panel, its order, dropped seats, at least two runners. Now: the `arena runners` line in OptChat's instructions; with no line, two runners on the host's preferred model, said so; a model `spawn` or the thread's start refuses drops that seat as below. Cost: with no line, the panel has one family. -->
3. Pick the runners. Use the `arena runners` role line in OptChat's instructions. If that line is missing, run two runners with no `model` (the host's preferred model) and say the panel is one family. An `auto` or `inherit-parent` entry means the host's preferred model, so omit `model` for it. If `spawn` or a thread's start refuses an entry, drop that seat and say so. A family is the model's vendor line (the provider and model family in its `provider/id`). If dropped seats leave fewer than two runners, add runners until there are two, or one when the line has one entry. Run each added runner on a remaining runner's model, or omit `model` when none remain, and say so. Start more runners when the arena covers multiple design directions. Use the same model N times when the work is generation-bound rather than judgment-sensitive. Pick each thread's model for the job, per the Threads section of the **poteto-mode** skill.
<!-- cube-adapt M11. Intent: each candidate writes somewhere only it writes. Cube: each candidate thread has its own machine; the shared location is git. Kept: separate outputs. Now: a branch per candidate thread; a scratch worktree per candidate in the in-thread form. Cost: none. -->
4. Give each candidate its own output location (OptChat: its own branch, `arena/<slug>/candidate-<n>`; in-thread form: a git worktree, otherwise `/tmp/arena-<slug>/candidate-<n>/`), per the **separate-before-serializing-shared-state** principle skill.

## Phase B: Fan out

<!-- cube-adapt M2. Intent: start all candidates at once with self-contained instructions. Cube: OptChat spawns threads; spawn returns at once. Kept: one launch, same task, own output, rationale. Now: one `spawn` call with N tasks. Cost: none. -->
Spawn all N candidate threads in one `spawn` call, each with the task, the shared grounding (pushed, or pasted), its own branch, and instructions to produce the artifact, push it, and report a short rationale naming the alternatives it considered and what it rejected.

If a candidate produces no output, proceed with N-1 and note the dropout.

## Phase C: Cross-judge

<!-- cube-adapt M3 M4. Intent: a read-only judge from a family other than the parent's. Cube: the judge is a read-only thread with a model from the pool line; the parent is OptChat, whose family the pool must avoid; the in-thread form has no judge. Kept: family rule, pool order, the skip rule. Now: spawn the judge thread with the pool line's first model of another family than OptChat's own model; without a pool line, a model the user listed of another family, else skip the judge and say so. Cost: none. The picker is the synthesis thread, so the judge's family differs from that thread's model. -->
After all Phase B candidates report, choose one model from the `arena cross-judge pool` role line. If that line is missing, use a model of another family from the user's lines, or skip the judge and say so. Spawn one read-only judge thread (no edits, no branch). The judge is never from the family of whoever picks the base (in cube, the synthesis thread's model), as Phase A step 3 defines families. Try only the entries from another family, in pool order. An `auto` or `inherit-parent` entry is the host's preferred model, so it judges only when that is of another family. If `spawn` or the thread's start refuses an entry, move to the next entry. If none from another family runs, skip the judge, pick the base alone in Phase D, and say so. If you do not know a model's family, say that the family check did not run. The judge sees the rubric and the candidates by path label, scores each criterion, and recommends a base with rationale. It runs in parallel with your reading in Phase D. Don't spawn it while candidates are still writing.

## Phase D: Pick a base

Read every candidate end to end before picking. Score each against the rubric criterion by criterion, not on holistic feel, and compare with the cross-judge when Phase C ran one. Agreement on the base confirms the pick. Disagreement means one of you is biased or the rubric was ambiguous. Read both rationales before deciding.

Pick the base a future maintainer can extend most easily without breaking invariants. When two feel tied, prefer the cleaner boundary or smaller API, per the Laziness Protocol.

## Phase E: Graft

Walk each losing candidate once more for what is worth porting into the base, usually one or two things per candidate, not most of it. Fold each graft in by hand, per the **redesign-from-first-principles** principle skill, so the result stays coherent under one mental model. Don't paste mechanically.

If the candidates converge on one shape, that is strong agreement. Note it and ship the consensus shape. No graft is needed. If they wildly diverge, Phase A was under-specified. Reframe and re-run rather than averaging the divergence.

## Phase F: Verify

Verify the synthesized artifact like any other output, per the **prove-it-works** principle skill. If verification finds a problem the arena missed, either Phase A was wrong (re-frame and re-run) or a candidate caught it and you missed the graft (go back to Phase E). Don't paper over it.

## Outputs

One synthesized artifact, with a short synthesis note alongside naming the base and why, the cross-judge's verdict or that Phase C skipped the judge, each graft with its source candidate, what was rejected and why, any convergence or dropouts, and the verification result.
