---
name: principle-build-the-lever
# cube-adapt M2. Intent: the lever is what delegates follow instead of hand-applying. Cube: delegates are threads OptChat briefs. Kept: the principle. Now: "threads you brief" in place of subagents. Cost: none.
description: "Apply to any non-trivial work, not just bulk work: edits, migrations, analyses, checks. Build the tool that does it or proves it (codemod, script, generator, or a skill the threads you brief follow) instead of working by hand. The tool is the artifact a reviewer can rerun."
disable-model-invocation: true
---
# Build the Lever

When the work isn't trivial, build the tool that does it instead of doing it by hand.

A codemod, generator, or script does the work the same way every time and reruns for free. The tool is one artifact a reviewer can read and rerun to check the work. Hand-done changes can only be re-verified by redoing them. A deterministic script turns "trust me" into "run this".

Default to building the lever. Skip it only when the task is trivial, a couple of obvious edits you can see at a glance.

- Do the first unit by hand to learn the recipe, then build the tool. Prove it by rerunning it on that unit and diffing against your hand-done version. Make the lever safe to rerun.
- Codemod or script for edits, generator for repetitive files, a dump-to-sqlite query for analysis, a rerunnable check for verification.
- A deterministic lever beats fan-out. If the tool can process every unit in one pass, run it yourself. Don't fan out threads to hand-apply what a script can do.
<!-- cube-adapt M2 M5. Intent: fanned-out delegates share one contract they cannot edit. Cube: in cube the delegates are threads OptChat starts; a thread reads skills pinned at its start and its own repository. Kept: one contract artifact, outside the workers' write scope. Now: write the lever as a committed file (a skill in the project's .agents/skills, or a script) on a branch the workers check out but do not push, and name it in every brief. Cost: a skill added on a branch is not listed to threads (cube lists project skills from the start commit), so the brief must name its path. -->
- When OptChat fans work out to threads, write the lever as a file they all read (a script, or a skill under the project's `.agents/skills`): the recipe, the verification contract, and the do-not-touch fences in one artifact. Commit it where every worker checks it out, name its path in every brief, and keep it outside the workers' write scope so they can't quietly edit the contract.
- Applying this principle produces a file. If you cited it and there is no codemod, script, generator, or delegate skill in the diff, you didn't apply it.
- Commit the lever when the work outlives the session.

The bar is triviality, not repetition. A one-off still earns a lever when the lever is what makes the work checkable. Per the [Laziness Protocol](../principle-laziness-protocol/SKILL.md), build the smallest script that does or proves the job, never a framework.

Distinct from [Encode Lessons in Structure](../principle-encode-lessons-in-structure/SKILL.md), which makes a recurring instruction a durable guardrail. This is throughput and reviewability on the work in front of you. For scripting the verification itself, see [Prove It Works](../principle-prove-it-works/SKILL.md).
