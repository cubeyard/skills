# Land

Only when the brief says to merge. Land exactly what was reviewed.

1. Check the live pull request against the brief: head commit, tree,
   base, mergeability and checks. Any difference from what the review
   approved is drift: stop and report it.
2. If the base moved and a rebase is needed, rebase, then prove the patch
   is unchanged (compare `git patch-id` or the diff of base to head) and
   wait for the checks on the new head.
3. Merge with the method the brief or the repository names.
4. Confirm the merge commit on the default branch and wait for the checks
   that run after landing.
5. Release, tag, deploy and restart are not part of landing.

Report: the merge commit, the checks on it, whether the landed patch is
the reviewed one and how you know, and anything that failed or was
retried, with the failure quoted.
