### Perf issue

**You own the measurement story. Plan, review, verify the numbers.** Tie every fix to a measurement, don't read source instead of measuring.

<!-- cube-adapt M12. Intent: drive the real surface the user sees. Cube: cursor-team-kit's control skills are not installed. Kept: the real-surface rule. Now: the project's verify-* skill, else Playwright's Chromium for web UIs or the shell for CLIs, in the thread's machine. Cost: native desktop and mobile surfaces are out of a thread's reach; say so rather than pass on a proxy. -->
1. Capture a baseline trace via the matching control surface. Vet the baseline, and each later number, with the **benchmark-checklist** skill.
2. `how` to ground hypotheses. Don't claim a perf ceiling without running it first.
   Try the performance mantras in order, cheapest first:
   1. Don't do it. Stop work whose result nothing uses rather than cheapening it.
   2. Do it, but don't do it again.
   3. Do it less.
   4. Do it later.
   5. Do it when they're not looking.
   6. Do it concurrently.
   7. Do it cheaper.

   When an earlier mantra meets the target, stop.
3. Plan the fix from the trace. If it crosses a function boundary, `architect` first.
   <!-- cube-adapt M1 M2 M4. Intent: the lead keeps judgment while a delegate on the role's model writes the code. Cube: a thread cannot start a delegate; OptChat chose this thread's model from the role line when it spawned it. Kept: the lead's planning, review and verification, and the role's model. Now: the thread writes the code itself, then reviews its own diff before verifying; independent review comes from a fresh thread OptChat starts. Cost: no second model inside the task. -->
   Implement it yourself (OptChat picked this thread's model from the `perf-issue` role line). Check your own diff before pushing (an author check). Capture a post-fix trace.
   Apply the **sequence-verifiable-units** principle skill, verifying each attempt before trying the next.
4. Parse and compare the artifacts (JSON to sqlite, diff). "Inconclusive" or wrong-surface is not a pass. Flag it.
5. Cite the measurement in the PR.
<!-- cube-adapt M3 (review handoff). Intent: the lead reviews the delegate's diff and verifies the numbers. Cube: the implementing thread is the delegate, so the lead's review would be the author reviewing itself; OptChat, the lead, has no machine and cannot open a diff or rerun a repro. Kept: an agent that did not write the fix checks the diff and reproduces the measurement. Now: step 7 hands off a review thread that reruns baseline and post-fix with the same method. Cost: a round through OptChat and a second measurement run. -->
6. Run **Opening a PR**.
7. Hand off the independent review and verification (`../references/cube.md`, the review handoff): the reviewer reruns the baseline and the post-fix measurement with your method at the PR head and checks them with the **benchmark-checklist** skill. End your turn; fixes come back as tells.

For sustained improvement against a metric rather than a one-off fix, use the Hillclimb playbook (`playbooks/hillclimb.md`).

**Reply:** baseline number, post-fix number, delta, artifact path.
