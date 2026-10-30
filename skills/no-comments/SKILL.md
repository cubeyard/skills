---
name: no-comments
# cube-adapt M2 M3. Intent: a fresh Comment Sicko judges the comments. Cube: it is a thread OptChat starts, or a labeled self pass. Kept: the fresh reviewer. Now: the description names both. Cost: none.
description: "Get a Comment Sicko pass (a fresh thread, or a labeled self pass), fix accepted findings, and offer encodings for claimed constraints."
disable-model-invocation: true
---

# No comments

Get a Comment Sicko pass. Act on accepted findings.

Defer to Comment Sicko's fresh perspective.

## Scope

Use the caller's files or diff. Otherwise use the current diff against the base branch, default `main`, including the working tree.

## Steps

<!-- cube-adapt M2 M3. Intent: a reviewer that did not write the comments judges them, with its own rules. Cube: only OptChat starts a fresh thread; a thread cannot. Kept: the fresh reviewer, its unrestated rules, and step 2's skepticism toward its report. Now: OptChat starts a Comment Sicko thread from `agents/comment-sicko.md` on the pushed scope; it commits its deletions on its own branch and reports; the author thread inspects and takes what it accepts. A thread without that pass hands it off (M2 handoff rule). Cost: a round trip. -->
1. Get a Comment Sicko pass over the scope ([`agents/comment-sicko.md`](agents/comment-sicko.md); do not restate its rules). In cube, OptChat starts it as a fresh thread on the pushed scope; it commits its deletions to its own branch (`<branch>-no-comments`) and reports its flags, and the author thread inspects that diff in step 2 and takes what it accepts. A thread with no such pass yet pushes its finished edits and reports a handoff for the Comment Sicko thread (`../cube-mode/references/cube.md` M2); steps 2 to 6 continue when OptChat tells it the result.
<!-- cube-adapt M2 (handoff rule). Intent: the comments are judged by an agent that did not write them. Cube: a thread cannot start agents and, by the user's rule, never stands in for one (no sequential role-play, no self-review substitute). Kept: Comment Sicko's rules and steps 2 to 6. Now: handoff, then continue on the tell; the self pass is removed. Cost: a round trip through OptChat. -->
2. Inspect its report and diff. Reject application-code edits, scope escapes, exception-protected deletions, misstated `MUST KILL` reasons, and flags that treat kept intentional code as guilty. Reshape flags on our-code surprises stay actionable. Do not restore those comments. A keep survives only with proof it is about something we cannot change. Audit missed scoped lint and TypeScript suppressions. Correctness or safety suppressions stay actionable `MUST KILL`s. Restore deletions only with exact exceptions and scoped proof. Before accepting thin `IMPORTANT` or `do not remove` kills or keeps, run `/how` or `/why` on their symbol. If a kill is ambiguous, do not restore. If a keep is refuted or still ambiguous, delete it. Revert and rerun one rejected report with the failure named. Reject a second, report it open, and fail `/no-comments`.
3. Fix trivial accepted flags directly by deleting a dead path, dropping a parameter, or using the real API. If any fix needs a shape, run `/architect` once for the accepted set and surrounding code. Stop at the sketch. Architect shapes. Step 4 implements.
4. Implement the smallest root-cause fix in scope. Remove every named workaround. If the root cause is out of scope, land the smallest in-scope fix and report the rest open. The **principle-fix-root-causes** and **principle-redesign-from-first-principles** skills guide intent only. Neither authorizes widening the fence nor fixing instances outside it. Never bolt on symptom guards.
<!-- cube-adapt M6 M9. Intent: encoding a constraint waits for the human unless pre-approved. Cube: a thread is never interactive; its pre-approval is the brief. Kept: the wait and the pre-approval rule. Now: with the brief's pre-approval encode; else offer it in the report. Cost: none. -->
5. Constraint comments say `do not remove`, `do not change wording`, or `talk to X before changing`. Leave keeps about things we cannot change. Offer the cheapest in-scope type, runtime, test, or CI lint. A thread has no interactive approval: encode only when the brief pre-approves it, else offer it in the report. If approved, encode then delete. Otherwise delete, report the constraint open, and sketch out-of-scope work.
6. Report the deletion count, restored comments, reruns, architect sketch, fixes, encoding offers, encodings, unenforced constraints, and other open work.
