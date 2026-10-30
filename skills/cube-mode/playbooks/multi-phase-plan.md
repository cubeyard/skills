### Multi-phase or multi-PR plan

**You own the plan, not the code. The plan is a checklist an owner runs box by box and the operator audits from the evidence.** The plan is the deliverable. Do not implement.

1. When the change is one or two files with an obvious approach, skip the plan. Say so and stop.
2. Settle open questions by prototype before you write. Run `playbooks/prototype.md` for each. Keep the branch, the SHA, and the screenshots for Appendix A. Ask the operator only about a product or preference call that no run can settle. Give options (the **never-block-on-the-human** principle skill).
<!-- cube-adapt M2. Intent: exploration runs in delegates so the planner's context holds pointers, not dumps. Cube: a thread cannot spawn; OptChat can. Kept: pointers, conventions, test commands and entry points, no dumps. Now: explore yourself area by area and write each area's pointers to a scratch file; for a very wide program, report the areas so OptChat can start one read-only thread each. Cost: one context explores it all. -->
<!-- cube-adapt M2 (handoff rule). Intent: exploration runs in delegates so the planner's context holds pointers, not dumps. Cube: a thread cannot start agents and, by the user's rule, never stands in for one (no sequential role-play, no self-review substitute). Kept: one explorer per area, pointers not dumps. Now: report a handoff with one read-only explorer brief per area; the reports come back as a tell and the plan continues. Cost: a round trip through OptChat. -->
3. Explore in fresh read-only threads (the **guard-the-context-window** principle skill): report a handoff with one explorer brief per area (`../references/cube.md`, M2), each returning file pointers, conventions, test commands, and entry points. No inlined dumps. Write the plan when OptChat tells you their reports.
4. Copy the skeleton below into the plan file and fill every placeholder.
   <!-- cube-adapt M10. Intent: the plan lives where the program's runner and the operator can read it. Cube: a thread's files leave with its machine; OptChat and the user read artifacts. Kept: one plan file. Now: write it as an artifact (and commit it only when the operator names a path). Cost: none. -->
   Unless the operator names a path, write the plan as an artifact (`artifact_write`), so OptChat and the user can read and comment on it. Keep every heading and every sub-block in the order shown. One section per PR. One PR is one change with its own evidence (the **sequence-verifiable-units** principle skill). Name the execution playbook in **How to read this**. Pick `playbooks/autopilot-full.md` when the run may merge. Pick `playbooks/autopilot-stack.md` when the operator lands the PRs. A standing program takes `playbooks/orchestrate.md`.
5. Write under `/technical-writing` in full, then `/unslop`. The body is one Diátaxis mode, how-to. Appendices hold explanation and reference. Each heading states the task or the finding. No long dashes. No mid-sentence colons.
<!-- cube-adapt M11. Intent: a script checks the plan's structure. Cube: the script is installed at ~/.cube/skills/cube-mode/scripts/, not in the project's tree. Kept: the check. Now: run it from there on a local copy of the plan. Cost: none. -->
6. Run `node ~/.cube/skills/cube-mode/scripts/check-plan.mjs <plan.md>` on a local copy of the plan and fix every line it prints (the **encode-lessons-in-structure** principle skill).
<!-- cube-adapt M1. Intent: the planner stops at the plan. Cube: a thread reports and ends its turn; OptChat runs the program on the user's go. Kept: stop. Now: report the artifact and the script's output. Cost: none. -->
7. Hand back. Report the plan's artifact (or path) and the script's output, then end your turn. Execution starts on the operator's explicit go, under the execution playbook the plan names.

**Verification.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked (the **prove-it-works** principle skill). That sentence is the verification rule. Every verification block opens with it. 
<!-- cube-adapt M3 M4 M12. Intent: ten independent live lanes per PR on the swarm workers model. Cube: lanes are verifier threads OptChat starts on the swarm workers role line; control skills are not installed. Kept: ten live lanes and the regression lane. Now: OptChat's swarm of threads, each on the role line's model, driving the project's verify-* skill, a real browser or the shell. Cost: ten threads per PR cost ten machines; capacity bounds how many run at once. -->
The live block is mandatory. Ten lanes at the PR head drive the real surface through its control surface, per the **swarm** skill, as threads OptChat starts on the `swarm workers` role line. Each lane is one box with a concrete scenario, the screenshot it saves, and its pass predicate. One lane is the **Regression lane against trunk.** It runs the same load-bearing scenario on trunk and head. If trunk does not have the feature, the lane records that fact and gates the behavior the diff adds plus the end state the user waits for instead of inventing a trunk result. The perf gate is dual-sided. Trunk and head must both produce the named metric. If trunk lacks the feature, also isolate the work the diff adds and set an absolute budget for that work plus the end-to-end state the user waits for. Do not claim a ratio between unlike scenarios. The perf block names the metric, the interleaved probe, the trunk baseline measured first, and the rule with the number that fails. A PR that changes an interaction is review-gated. The operator reviews it in chat with screenshots and a video before merge. A PR that changes no interaction writes `**Review gate.** None. <PR id> is not review-gated.` and no boxes under it.

<!-- cube-adapt M12. Intent: each surface has its driver. Cube: cursor-team-kit is not installed; threads have no simulators. Kept: a named driver per surface. Now: the project's verify-* skill first; else Playwright's Chromium for web UIs and the shell for CLIs and TUIs; native mobile has no cube surface. Cost: Electron and mobile lanes become risks in Appendix C. -->
**Control skill.** Pick it by surface. The project's own verification skill (`.agents/skills/verify-*`) comes first. Otherwise browser and web UIs use a real browser (Playwright's Chromium in the thread), and CLIs and TUIs use the shell. Native mobile and Electron have no cube surface: record that as a risk. A PR that touches two surfaces gets lanes on both. A surface with no control skill is a risk in Appendix C, and its live block still names how each lane drives it.

<!-- cube-adapt M5 M7 M10 M12 (the skeleton below; notes cannot sit inside it, because a plan copies it verbatim). Intent: the skeleton makes the runner re-read the current skills each tick on a fixed cadence, run the slop and comment gates, run lanes on their own machines with a control skill, and post review media in chat. Cube: skills are installed at ~/.cube/skills/ (OptChat reads them with skill()); OptChat has no timer and wakes on reports and the user's messages; deslop and the control skills are not installed; each lane is a thread; chat and artifacts cannot play video. Kept: every heading, box and rule the skeleton enforces, and check-plan.mjs's markers (adapted in step with it). Now: installed skill paths, a tick at every report and message of the user, unslop plus a diff reread for deslop, a thread per lane, review media on the PR linked from an artifact. Cost: no fixed one-hour audit; a long silence needs the user's nudge. -->
````markdown
# <Program> plan

<Under ten lines. What changes, for whom, the rule the program enforces, and the PR ids in order.>

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `~/.cube/skills/cube-mode/playbooks/<execution playbook>.md`. <Who merges, and which PR ids are the operator's items that stop at merge-ready.>

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on the operator's explicit go.
- [ ] Read these at program start. Re-read them at every tick.
  - [ ] `~/.cube/skills/cube-mode/playbooks/<execution playbook>.md`
  - [ ] `~/.cube/skills/swarm/SKILL.md`
  - [ ] `<control skill path>`
  - [ ] `~/.cube/skills/cube-mode/playbooks/opening-a-pr.md`
  - [ ] `~/.cube/skills/<each other leaf skill the program uses>`
- [ ] On the operator's go, run the audit tick at every report and every message of the user, with the tick prompt below. Never leave the cadence to memory.
- [ ] Use this tick prompt, verbatim. "Re-read the execution playbook. Audit the operation against it and fix drift in this tick. Probe every active lane and judge progress by side effects only. Stand down a stuck lane and dispatch its replacement now. Then post a short status message to the operator in chat only when the audit found a tracked change that no earlier status message reported, such as a PR opened, a code-ready head, a round launched or closed, a verdict, a merge, a stuck agent and the action taken, a blocker added or cleared, or a decision only the operator can make. Name every such change and nothing else. Do not repeat a table, the merged list, or an unchanged blocker. If the audit found none, end the turn with no reply text. Either way, log this tick's row in your decision trail. The row names the items reported, or none."
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per PR with the full lifecycle the execution playbook names.
- [ ] Follow this dependency graph. Start dependent work only after its parent merges, or base it on the parent branch when the execution playbook stacks.
  - [ ] <PR id> and <PR id> are independent and first. Both branch from `main`.
  - [ ] <PR id> after <PR id>.
- [ ] Hold the file boundaries. <PR id or class> touches only `<glob>`.
- [ ] Hold the review gate. <PR ids> change an interaction. They wait for the operator's review in chat with screenshots and a video before merge.

### PR mechanics, for every PR

- [ ] Resolve the forge once. Default to `gh`; if `command -v origin` succeeds and Origin can resolve the repository, use `origin pr` for every PR operation. Record any fallback to `gh`. Never require `gt`.
- [ ] Open the PR ready, never draft, per **Opening a PR**. Use the run's built-in PR tool when it has one, else `origin pr create --status open --base <base-branch>` or `gh pr create --base <base-branch>` according to the resolved forge. A stack child targets its parent branch.
- [ ] Run the repo's lint and typecheck once before the PR-facing push. Push with hooks on.
- [ ] Run **unslop** and reread the diff before each commit (`/deslop` is not in cube), and `/no-comments` before review.
- [ ] Triage every Bugbot and security-reviewer comment per `../references/bugbot-triage.md`.
- [ ] Rebase onto current trunk before the code-ready report and babysit. Keep that merge base in fix rounds. Rebase again only at merge prep, on a `git merge-tree` conflict with trunk, on a CI failure that comes from a change on trunk, or when a known concurrent change to the same files lands.

### Verdict and merge, for every PR

- [ ] A full swarm runs once, at the code-ready head. Another full swarm runs only for new behavior, a redesign, or a large new diff. A rebase, a merge-conflict resolution, or a minor fix gets a single verifier at the new head, and a wording-only change gets none. Run each full swarm per `~/.cube/skills/swarm/SKILL.md`. One gates lane. The ten live lanes from the PR's **Verify, live** block. The perf lane from its **Verify, perf** block. Two or more audit lanes, each with its own focus, that read the diff and the receipts and distrust the PR body. The root audits the receipts in the merge-ready report before the verdict.
- [ ] Judge every finding by the execution playbook's blocking rule. The verdict is clean when none blocks. A failure on trunk behavior in a lane marked `Regression lane against trunk.` is recorded against trunk and does not block the PR. A new head gets a fresh verdict, except for results that stay valid under the patch-id rule in `playbooks/shipping.md`.
- [ ] <The merge or handoff rule from the execution playbook, with the patch-id rule from `playbooks/shipping.md`.>

### Boot recipe, for every live lane

Each live lane runs in its own thread at the PR head. Drive through the control surface named under **Control skill**.

- [ ] `git fetch origin <head-branch> && git checkout <head SHA>`.
- [ ] <Start the backend and the surface. Wait for ready.>
- [ ] <Deliver input only through the control skill's commands. Name the read-only diagnostics.>
- [ ] Save every screenshot to `/tmp/swarm-<pr-id>/worker-<n>/<slug>.png` and return the paths with the report.

## <Task as a verb phrase> (<PR id>)

**Depends on.** <PR id, or None.>

**Files.**

- [ ] Edit `<path>`.
- [ ] Create `<path>`.
- [ ] Delete `<path>`.

**Build.**

- [ ] <One change. Name the symbol and the file.>

**You see.**

- [ ] <One observable result, with the exact log line or screen state.>

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] <Test file and the case it gains.> Run `<command>`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `<swarm workers model>` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run <the same load-bearing scenario> at trunk and head. If trunk lacks the feature, record that and gate <the behavior the diff adds plus the end state the user waits for>. Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 2. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 3. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 4. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 5. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 6. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 7. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 8. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 9. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 10. <Scenario.> Save `<slug>.png`. Pass when <predicate>.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. <What is measured at both trunk and head. If trunk lacks the feature, also name the diff-added work and the end-to-end state the user waits for.>
- [ ] Probe. <The command or procedure, run at trunk and at the head, interleaved. Both sides must produce the metric.>
- [ ] Baseline. Record the trunk <value> first.
- [ ] Rule. <Head against trunk, with the number that fails. If the scenarios differ, add absolute budgets for the diff-added work and the user-visible end state instead of an invalid ratio.>

**Review gate.** The operator reviews before merge.

- [ ] Copy lane <n> screenshots into `<media path>/<pr-id>-review-<slug>.png`.
- [ ] Record a 30 to 60 second video of the change on a lane machine. Save it as `<media path>/<pr-id>-review.mp4`.
- [ ] Put the screenshots and the video where the operator can open them (the PR, or the branch), link them in the review artifact, stop at merge-ready, and wait for the operator's go.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] <The owner squash-merges its own PR, or the root appends it to the base-branch stack and the operator lands it bottom-up.>

## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] Reply to the operator with the report the execution playbook names.

## Appendix A. Prototype evidence

<Each open question a prototype answered, with the branch, the SHA, and the artifact links. Each question that stays unproven.>

## Appendix B. Alternatives rejected

<Each approach weighed and why it lost.>

## Appendix C. Risks

<Each risk with the PR it lands in and what the owner watches.>

## Appendix D. Links and reading list

<Docs to read before editing. Which PRs get `~/.cube/skills/how/SKILL.md` and `~/.cube/skills/interrogate/SKILL.md`. The trail per `~/.cube/skills/show-me-your-work/SKILL.md`.>
````

**Reply:** the plan path, the PR ids with their dependencies and the review-gated set, what the prototypes proved and what stays unproven, and the check script's output.
