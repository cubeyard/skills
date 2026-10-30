# Change

New or changed behavior, or a restructuring that keeps behavior.

1. Read the affected code and its documents first. Name the data shape
   the change works on before writing logic, and where the change
   belongs.
2. Remove what the change makes dead before adding to it.
3. Build in small steps that each end in a check you ran. Commit each.
4. Test behavior, not implementation: call the code as its users do and
   assert a literal expected value. A test that still passes when the
   change returns nothing proves nothing.
5. Choose further tests by concrete risk (see the skill's "Test by
   risk"), and say which risk each heavy gate covers.
6. Open the pull request as
   [opening-a-pull-request](../../opening-a-pull-request/SKILL.md) says,
   and wait for its checks yourself. Do not merge.

Report: what changed and why this shape, the alternatives you set aside,
the pull request and head commit, the checks and their results, and the
open decisions.
