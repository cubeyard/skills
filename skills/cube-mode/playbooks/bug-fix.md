### Bug fix

**You own this task. Plan, review, verify.** In cube you are the thread that does the investigation and the fix, under the lead's discipline for planning and evidence; the lead's review and verification of the fix is a fresh thread you hand off to (step 7).

Be scientific. Every shipped line traces to runtime evidence. Belt-and-suspenders that "might help" is a hypothesis, not a fix. It does not ship. When evidence refutes a hypothesis, revert what it motivated. The smallest change the evidence justifies ships, nothing more.

1. Reproduce it yourself on the matching surface via the control surface (Non-negotiables), even when a debug or instrumentation protocol says to ask the user to reproduce. Ask the user only with a stated, specific reason the control surface cannot reach the target, and only after driving it as far as it goes. If it won't reproduce directly, synthesize the trigger, tighten conditions, or instrument until it fires.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives. Seed them with `how` over the affected subsystem and the **why** skill for regression history. Each pass, take the split that cuts the most remaining problem space, get runtime evidence, eliminate. When program state is unclear, add instrumentation or logging and read it as the code runs.
Don't guess. Drive a long or stubborn hunt as a loop inside your own turn, with bounded commands, until the mechanism is confirmed. Confirm the surviving *mechanism* with runtime evidence before the step-3 architect/interrogate fan-out.
3. Plan the fix. If it crosses a function boundary, `architect` first. Implement it yourself with a specific scope; OptChat picked this thread's model from the `bug-fix` role line.
4. Verify on the same surface. The original repro now passes. "Inconclusive" or wrong-surface is not a pass. Flag it. Unit tests show branch behavior, not bug absence.
5. Stage the commits so the failing repro lands before the fix in git history. See the **tdd** skill for the failing-test-first cadence when the bug has a cheap local test path. Skip it when the test would be expensive, integration-heavy, or unclear.
   This is the canonical **sequence-verifiable-units** principle skill, the failing test first and the fix on top.
6. Run **Opening a PR**.
7. Hand off the independent review and verification (`../references/cube.md`, the review handoff): the reviewer reruns the failing-then-passing repro at the PR head. End your turn; fixes come back as tells.

**Reply:** what was broken, root cause, fix, how you verified. Paste failing-then-passing repro output verbatim.
