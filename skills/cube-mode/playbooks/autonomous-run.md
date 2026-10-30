### Autonomous run

**You own the exit condition. Define done, then drive to it without stopping.**

1. State the exit condition as a checkable predicate before the first iteration (tests green, repro fixed, all N PRs merged, pixel-diff zero).
2. Pick the wake mechanism. In a thread, it is your own turn: an event to watch (CI, a merge, a ref advancing) gets a bounded foreground wait you repeat (`timeout 590 gh pr checks <n> --watch`, or a watcher's `--timeout 590`), and no event gets a check at an interval sized to when the result is worth re-checking. Never end your turn to wait. A run that spans several tasks is OptChat's: each report is its wake-up.
3. Each iteration makes the smallest change the evidence justifies, verifies it against the predicate, commits if it advanced, discards changes that didn't help. Belt-and-suspenders that "might help" gets reverted, not left to ride.
   Sequence the work via the **sequence-verifiable-units** principle skill, verifying each unit before the next instead of batching checks at the end.
4. Mid-run discoveries that support the goal are yours. 
   Address broken skills, related bugs, flaky verifiers, review noise, tooling failures, orphaned follow-ups, and fixable drift that belong to your task yourself via cube-mode. An out-of-band fix belongs in its own PR, which is a new task: name it in your report as a follow-up for OptChat to start under the same grant. Do not park reversible work for the human or stop to ask. Surface only irreversible actions, genuine product or preference calls no experiment can settle, or a real dead end. Keep the predicate as the main drive, and return to it after each side fix.
5. Checkpoint every iteration via the **show-me-your-work** skill, a row for what changed and whether the predicate moved.
6. Stop when the predicate is met. A plateau is not a stop, so keep going and pivot your approach to push past it. Surface a genuine dead end rather than spinning, and never relax the predicate to declare victory.

**Reply:** the exit condition, iterations run, what landed, what was discarded, final predicate state.
