# Review

An independent verdict on someone else's change. You edit nothing.

1. Pin what you review: the pull request, its head commit, its base and
   the checks on that exact head. If the head moves while you work, say
   which commit your verdict covers.
2. Read the whole diff against the brief's criteria and the repository's
   rules, not the author's description of it.
3. Run what carries the risk: the changed path, the tests that should
   catch a regression, a mutation (break the change, see a test fail) when
   the tests' strength is in doubt. Name each concrete risk and how you
   checked it.
4. Classify each finding: blocker (wrong, unsafe or unproven where it
   must be proven), should-fix, or note. A finding needs its evidence: the
   line, the input, the failing run.

Report: verdict (approve, approve with notes, or changes needed) for the
pinned head commit, each finding with its evidence, what you ran and
what you could not, as an artifact when it is long.
