# Investigate

The deliverable is a cited answer or a recommendation, not a change.

1. Restate the question and what would answer it. If its premise is
   checkable, check that first.
2. Read the code paths involved and run them where you can. Cite
   `file:line` and command output for each finding.
3. For a "why was it built this way" question, read the history:
   `git log -S`, the pull requests and the documents that introduced it.
4. For a choice between options, give a short table of the options, what
   each costs and what evidence favors it, then your recommendation.
5. No branch, commit or pull request. If the answer shows a change is
   needed, say so in the report as the next task; do not start it.

Report: the answer first, then how it works or why, where things live,
gotchas, and facts, hypotheses and unknowns kept apart. Write it as an
artifact when it is worth reading at length.
