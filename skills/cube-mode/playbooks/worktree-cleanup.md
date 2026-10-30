### Worktree and simulator cleanup

In cube: to free machines, OptChat lists `threads`, asks the user about any with work not pushed, and archives the done ones (`archive` keeps their history). The steps below are for a thread pruning scratch worktrees inside its own machine.

1. Snapshot and audit. Record `df -h /`, then run `scripts/worktree-audit.sh [-b <pr-base-ref>] [repo-path]` (principle-build-the-lever). Without `-b` it checks `MERGED` against `origin/HEAD`, so pass `-b origin/<branch>` when PRs target another branch. 
   It reads paths from `git worktree list`, never hand-typed, since a hand-typed path misses a worktree that lives elsewhere (principle-encode-lessons-in-structure). It classifies each worktree by size, age, merge state, uncommitted work, PR state, and the newest chat that touched it (none in cube: its transcript scan finds nothing and is skipped), then suggests a bucket.
2. The bucket is advice, not permission. The work your task still uses is the real artifact (principle-prove-it-works). Cross-check every candidate against it.
3. Verify usage before deleting. Anything you cannot account for stays.
4. Pause on irreversible loss. `wip:N` is N tracked uncommitted edits. Show the diff and get a decision first, since removing a clean worktree is recoverable from its branch but uncommitted work is gone. `scratch:N` is untracked throwaway, safe to drop, but name the files. Per Autonomy, clean and merged and not-in-use proceeds. `wip` and in-use pause.
5. Prune the confirmed set. Per path, `git worktree remove --force <path>`. If the dir survives on ignored build artifacts, `rm -rf` it, then `git worktree prune`. Branch refs survive, so no commits are lost. Confirm with `df -h /` and re-list.
6. Other reclaimers. Package caches in the thread's machine (pnpm, npm, uv, cargo). Clear only caches the brief has not said to keep. Skipped in cube: iOS simulators, Xcode and Cursor state, which no thread reaches.

This is the one playbook that deletes user state with no code review to catch a slip, so the gates above are the review.

**Reply:** `df -h /` before and after with space reclaimed, the worktrees pruned, and a one-line reason for each held back (in-use by which chat, or uncommitted work).
