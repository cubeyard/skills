---
name: interrogate
description: "Use for \"interrogate\", \"adversarial review\", \"multi-model review\", \"challenge this\", \"stress test this code\", \"find blind spots\", or \"tear this apart\". Adversaries try to break a change or design, and only findings proven by a run survive."
disable-model-invocation: true
---

# Interrogate

Adversaries try to break a change or a design. A finding survives only when a run proves it. Report the findings. Do not apply fixes.

## Frame

The scope is what the user names. Otherwise it is the branch diff from its merge base with the base branch, through the working tree. State the intent with the **in-your-own-words** skill, from the user's message, the commits, and the PR description. Ask the user when the intent is unclear.

<!-- cube-adapt M1 M2 M3. Intent: adversaries on different models try to break the change independently. Cube: adversaries are threads only OptChat starts; a thread alone has one model. Kept: the brief, run-proven findings only, verification by rerun. Now: OptChat spawns one adversary thread per reviewer line; a thread asked to interrogate hands it off (M2 handoff rule). Cost: none. -->
## Fan out

In cube, OptChat spawns the adversaries as threads, each read only on the PR's branch (repros in a scratch directory, never pushed), and verifies their findings with one more thread or with the PR's author thread. A thread asked to interrogate its own or another change pushes the scope and reports a handoff with one adversary brief per reviewer line (`../cube-mode/references/cube.md` M2); it does not play an adversary itself.
<!-- cube-adapt M2 (handoff rule). Intent: adversaries that did not write the change. Cube: a thread cannot start agents and, by the user's rule, never stands in for one (no sequential role-play, no self-review substitute). Kept: the brief and run-proven findings. Now: a thread hands off; the labeled single pass is removed. Cost: a round trip through OptChat. -->

Run Phase A steps 3 and 4 and Phase B of the **arena** skill, with four changes. <!-- cube-adapt M4 M11. Intent: each adversary sees exactly the scope. Cube: adversary threads check out a pushed branch; uncommitted changes do not reach them. Kept: the reviewer line and the exact scope. Now: push the scope first (a branch or the PR head) and name its commit in each brief. Cost: none. -->
Read the `interrogate reviewers` role line in place of `arena runners`. Push the scope's uncommitted changes first and name the exact commit in each adversary's brief. In place of the arena task and rationale, give each adversary the scope, the intent, and this brief:

> Break this change. Prove each finding with a run against the real code, such as a failing test, a repro script, or command output that shows the wrong behavior. For a design or plan, run a prototype or probe the current tree. Keep repros in your own worktree. Report each finding with a title, the exact command, the output it printed, and the output the intent requires. Leave out anything you did not run. That covers style, naming, structure, and risks that need a future change to matter. No findings is a valid result.

## Verify

Verify each finding per arena Phase F by rerunning its command. Keep a finding when the output shows the failure and the failure breaks the intent. Drop the rest. Merge findings that share a root cause.

Skip arena Phases C, D, and E. Adversaries find different failures, so the verdict keeps every verified finding, not one adversary's list.

## Output

- **Intent**: the restatement.
- **Findings**: for each verified finding, the command, its output, how it breaks the intent, and the adversaries that found it. Say "no verified findings" when none survive.
- **Dropped**: for each adversary, the count of dropped findings and why.
