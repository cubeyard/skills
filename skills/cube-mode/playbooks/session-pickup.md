### Session pickup

**You own the resume point. Read the prior trail, don't redo it.**

1. Locate the prior trail: the prior thread's conversation (OptChat reads it with `history(id)` and pastes the reduced timeline, decisions and open todos into your brief), an artifact, OptChat's chat with the user (your memory tools, where the brief points), or a pushed branch. Read only what this work is about. Read the overview and last messages first, then scan back for the decision points. Keep only the reduced timeline in your context (the **principle-guard-the-context-window** skill).
2. Reconstruct operational state. The branch and worktree, what already landed (`git log`, `git diff` against the base), the open todos, the decisions made. The prior trail is authoritative input. Resist the bias to re-derive it.
3. Diff done vs pending. Compare what shipped against what was planned, name the resume point, do not re-run the prior repro or redo completed work. A "let me verify from scratch" pass means you're treating the trail as untrustworthy when it's authoritative.
4. Route the remaining work to the matching playbook and pick the verdict: continue the execution, ship a finished recommendation, ratify or override a prior conclusion, or postmortem a failed run. The pickup playbook ends here. The routed playbook owns the rest.
5. Verify the inherited claims against the original goal on the real artifact (the **principle-prove-it-works** skill). A passing prior self-report is not the proof.

**Reply:** where the prior agent stopped, what you inherited vs redid (ideally nothing redone), the resume point, and the outcome.
