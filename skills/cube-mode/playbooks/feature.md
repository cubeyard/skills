### Feature

**You own the design. Plan, review, verify.** In cube you implement it too; independent review of your PR comes from a thread OptChat starts.

1. `how` over the affected subsystem.
2. `architect` for parallel design exploration.
3. Write the throughput checkpoint as four todo items. A dimension that genuinely does not apply (single file, no fan-out) keeps its item with `n/a: <reason>` rather than being dropped:
   - **Blocking first steps.** Gates run before fan-out.
   - **Independent workstreams.** Disjoint files, services, or layers parallelize. Shared writes serialize.
   - **Shared mutable state.** Default to splitting the target (the **separate-before-serializing-shared-state** principle skill). Serialize only for real invariants.
   - **Smallest safe decomposition.** If one worker is best, name why.
4. Write the code yourself (OptChat chose this thread's model from the `feature, refactoring` role line) with a specific scope (file paths, named data shape and its organizing structure per **principle-model-the-domain**, a state machine over scattered booleans, a table/registry over branching, a typed model over repeated shape assumptions, chosen before the delegate writes logic, and success criteria). When the implementation admits multiple valid shapes (error handling, abstraction layer, test structure), go through the **arena** skill instead so the alternatives surface and a judge guards the pick: a thread reports an arena handoff (`../references/cube.md`, Handoff) and ends its turn, and implements the picked shape when OptChat tells it. Mandatory: no skip-with-reason escape, and Laziness Protocol does not override it (the gain is review separation, not lines saved). No "standing by" reply that waits on another agent. Comments per **Comments**. Surgical edits, re-ground against the source for upstream-derived files. Port shared-primitive improvements to all consumers and verify each. Commit liberally.
5. Verify on the matching surface (the control surface in the Non-negotiables). "Inconclusive" or wrong-surface is not a pass. Flag it.
6. Rebase into small, ordered commits. Stack follow-ups.
   Use the **sequence-verifiable-units** principle skill, building, verifying, and committing each small unit before the next.
7. If the design is contested, `interrogate` before shipping.
8. Run **Opening a PR**.
9. Hand off the independent review and verification (`../references/cube.md`, the review handoff): the reviewer drives the change on the matching surface at the PR head. End your turn; fixes come back as tells.

Code-coupled work (one feature, one migration) goes to a single owner thread with the checkpoint inline. That owner works its phases in order; it does not fan out. OptChat's fan-out is for slices that produce independent artifacts (audits, cross-subsystem investigations, competing experiments). Rewrite the checkpoint at phase boundaries. OptChat gives a new phase to a fresh thread rather than chaining interrupts.

**Reply:** what you built, what you chose and why, the throughput checkpoint, open decisions. Tables for design alternatives.
