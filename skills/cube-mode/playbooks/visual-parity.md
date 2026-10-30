### Visual parity

**You own pixel-exact equivalence. The baseline is the spec. You do not touch it.** Equivalence is verified by image diff, not by eye.

1. Establish the baseline first, before any migration: a visual regression harness that screenshots the current component across its states, plus the target when matching two implementations. No baseline, no parity claim. A blocking prerequisite, not a follow-up.
2. Anti-shortcut clauses, stated and held: no harness modifications, no baseline tampering, no component restructuring to make a diff pass. If the baseline looks wrong, stop and ask, don't edit it.
<!-- cube-adapt M1 M2. Intent: parallel owners on disjoint components, shared primitives first. Cube: owners are threads only OptChat can start. Kept: one owner per component, primitives first. Now: OptChat starts one thread per component after the primitives land; a single thread does them in order. Cost: none. -->
3. Migrate one component at a time. Parallelize across threads OptChat starts, one owner thread per component (the **separate-before-serializing-shared-state** principle skill); a single thread does them in order. Shared primitives migrate first as a blocking phase.
<!-- cube-adapt M12. Intent: drive the real surface the user sees. Cube: cursor-team-kit's control skills are not installed. Kept: the real-surface rule. Now: the project's verify-* skill, else Playwright's Chromium for web UIs or the shell for CLIs, in the thread's machine. Cost: native desktop and mobile surfaces are out of a thread's reach; say so rather than pass on a proxy. -->
<!-- cube-adapt M7. Intent: iterate until zero. Cube: no /loop. Kept: iterate until the diff is zero. Now: loop inside your turn. Cost: none. -->
4. Verify each component against its baseline via image diff on the matching surface via the control surface. A nonzero diff is a fail. Investigate the pixel delta. Loop per component, inside your turn, until the diff is zero.
5. Run **Opening a PR** per component or per safe batch.

**Reply:** components migrated, the diff result for each, the baseline harness location, what's left.
