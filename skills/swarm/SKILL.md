---
name: swarm
description: "Fan out N parallel workers, drain them, and return one report. Use for /swarm, 'swarm this', or parallel coverage, races, gauntlets, and exploration."
disable-model-invocation: true
---

# Swarm

## Start

<!-- cube-adapt M1 M2. Intent: N parallel workers across slices or races, drained into one report. Cube: only OptChat starts workers (threads); a thread cannot. Kept: the phases, the shapes, the selection rules, the result schema. Now: OptChat runs the swarm; a thread asked to swarm runs slices itself in order and proposes the rest. Cost: a thread's race is not a race; say so. -->
**In cube, OptChat runs a swarm**: each worker is a thread. A thread asked to swarm runs coverage slices itself, one after another, each against the same done predicate, and reports any race or model comparison as a proposal for OptChat (a race run by one agent in sequence is not a race).

Open a todolist with one entry per phase before launching anything.

1. Frame
2. Fan out
3. Aggregate
4. Report

## Phase A: Frame

1. State the done predicate and the artifact or report the swarm must return.
2. Choose the shape. Partition into slices, race N workers on identical briefs, or mix both. For a race or mixed shape, declare `first pass`, `rank all`, or `best-of` before spawning.
<!-- cube-adapt M4. Intent: one configured worker model, named arms for a model race. Cube: models are cube model ids from the role lines; Cursor slugs are invalid. Kept: the line, the race arms. Now: the `swarm workers` line in OptChat's instructions, else omit `model`. Cost: none. -->
3. Pick the worker model from the `swarm workers` role line in OptChat's instructions. If that line is missing, or says `auto` or `inherit-parent`, omit `model` so the workers run on the host's preferred model. If `spawn` or a thread's start refuses a model, omit `model` and say so. For a model race, name each arm's model up front.
4. Give each worker its own writable output when it writes. When workers verify or measure commits, each brief names the exact SHAs. A measurement brief also names the method (sample count, what one sample is, order). The worker records both in its result.

## Phase B: Fan out

<!-- cube-adapt M2 M11. Intent: all workers start together, each on its own machine, from the right branch. Cube: spawn starts one thread per task, each its own VM with a fresh checkout; nothing reaches the user's computer. Kept: one launch, isolation, the base branch. Now: one `spawn` call; the brief names the branch or commit to check out first. Cost: no worker can reach the user's computer. -->
Spawn all N workers in one `spawn` call, each a thread on the step 3 model. Each thread already has its own machine and checkout; nothing reaches the user's computer, so a slice that needs it is a gap.

When a worker must start from a non-default pushed branch or commit, the brief says to check it out first.

Every brief stands alone. Include the goal, scope, exact slice or race arm, how to verify, and what to report. Reports use `PASS`, `ISSUES`, or `BLOCKED` with evidence. A worker that can prove a defect reports `ISSUES` and lists every issue it can prove, not only the first.

If a worker drops out, proceed with N-1 and note it.

## Phase C: Aggregate

Read the terminal results. Drop a result that does not record the SHAs and method its brief names, and respawn that worker once. After a second miss, record a gap. A gap does not count as a pass. For coverage, every required slice needs a result. For a race, apply the selection rule declared up front. Use first pass, rank all, or best-of. Do not paste raw worker dumps.

## Phase D: Report

Return one consolidated in-chat report with a result table, issue one-liners, gaps or dropouts, and the race rule when used.
