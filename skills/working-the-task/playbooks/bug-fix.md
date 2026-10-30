# Bug fix

Every line you ship traces to runtime evidence.

1. Reproduce it yourself, on the surface where it fails. If it will not
   reproduce, narrow the conditions, synthesize the trigger or add
   instrumentation until it does. If it still cannot be reached here,
   report why and what would reach it.
2. List the candidate causes and rule them out with evidence, each step
   cutting the most remaining space. Read `git log` for when it began.
3. Confirm the mechanism before you fix it.
4. Write a failing test or repro first when one is cheap, then the
   smallest fix. Keep the failing test before the fix in the history.
5. Verify on the same surface: the original repro now passes. A unit
   test shows a branch's behavior, not that the bug is gone.
6. If the task includes a pull request, open it as
   [opening-a-pull-request](../../opening-a-pull-request/SKILL.md) says.

Report: what was broken, the root cause with its evidence, the fix, the
repro output before and after, verbatim.
