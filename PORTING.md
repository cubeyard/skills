# Porting the skills to cube

The original stack (Lauren Tan's agent workflow stack, MIT) is a set of 58 skills and 2
agent definitions written for another agent host: one chat that plans,
spawns subagents on chosen models and reviews their work. This repository
ports all of it to cube, where that one chat becomes two agents: OptChat,
which directs and has no machine, and threads, which each do one bounded
task in their own machine and report. Nothing is dropped silently. 57 skills
are here, with their references, scripts and assets; one, the model setup skill, is
retired on purpose (Retired, below), and its original stays in the
baseline. Every change from the original is justified here.

## Layout

```text
skills/<id>/            what cube installs: 57 ported skills + cube's own 3
skills/cube-mode/references/cube.md   the cube adapter every ported skill relies on (the rules M1-M13, by section name)
scripts/check-port.mjs  the checks below
scripts/branding-patterns.mjs  the retired brand names, spelled so the file passes its own check
THIRD_PARTY_NOTICES.md  the stack's MIT license, beside this repository's Apache-2.0
```

## Baseline

The port started from an unmodified copy of the stack at its upstream commit
`4dd1d05818d19792e7cd6e818f1667f95f7e1dbe` (plugin version 0.15.36, 573
files). The copy, its sha256 manifest, its provenance (`upstream/README.md`)
and the per-file coverage table (`COVERAGE.md`) were in this repository's
tree until the user asked that neither retired brand name appear in it
(Naming). They are removed from the tree, not from history: commit
`b052d0d2f088e81c0c0237b2fe33acb1e33b4bba` holds them, and git still proves
the copy is byte for byte upstream's:

```sh
git ls-tree -d b052d0d2 upstream/        # one directory, tree 4719e1c4b4c43bac85d4206a8b41dd2899769c1c, upstream's tree
git diff b052d0d2:upstream/<that directory>/skills/how HEAD:skills/how   # one port against its original
```

cube installs only `skills/`, so the original never reached a thread or
OptChat, and removing it changes nothing a thread installs. A depth-1 fetch
of this repository no longer carries it (G10).

## Method

1. **Copy as is.** Commit 1 added the unmodified copy with a sha256 manifest.
   Its git tree equals upstream's tree for the stack (Baseline).
2. **Copy into place.** Every upstream skill folder is copied to
   `skills/<id>/` unchanged; the two agent definitions go into the skill that
   starts them (`cube-mode/agents/cube-mode-agent.md`,
   `no-comments/agents/comment-sicko.md`), since cube has no agent definitions.
   The original stack's `LICENSE` is copied into every ported folder, because cube
   installs each folder on its own.
3. **Adapt in place.** Each change is an edit at the spot it concerns. A
   file that needs no change stays byte-identical (33 of the 57 ported skills
   were unchanged, and 529 of 593 mapped files, before the branding removal).
4. **Check it mechanically** (`node scripts/check-port.mjs`, below), so that
   "no silent omission" is a test, not a promise.

### No notes in installed files

The first port put a `cube-adapt` note (Intent, Cube, Kept, Now, Cost, and
the rules it applied) above every change. The user reversed that on
2026-10-30: installed skills must read as operational instructions, not a
narrated port. The notes are removed, and `skills/` cites no rule by number;
cube.md names its rules by section instead:

| rule | section of `references/cube.md` |
| --- | --- |
| M1 | Who you are |
| M2 | Delegation, Handoff |
| M3 | Delegation, Independent review (and the review handoff) |
| M4 | Models |
| M5 | (discovery; no section, the Tools table's skill row) |
| M6 | Questions |
| M7 | Waiting |
| M8 | Same task, same thread |
| M9 | Authority |
| M10 | Records and memory |
| M11 | Environment |
| M12 | Features cube lacks |
| M13 | Links |

The reason for each change is the mapping rules below and the commit that
made it (the port's notes are in git history before the removal);
`git diff` against the baseline (above) shows the change itself.

### What the checker enforces

| check | how |
| --- | --- |
| the MIT notice travels with every ported skill | every skill folder outside cube's own three has a `LICENSE` whose sha256 is the baseline's MIT notice (`MIT_SHA256`), and THIRD_PARTY_NOTICES.md quotes that notice in a fenced block byte for byte; deleting `skills/how/LICENSE`, editing a notice, or cutting the copyright line from THIRD_PARTY_NOTICES.md fails (fixtures) |
| the model rule (M4) | every installed Markdown file is scanned for wordings that point at the retired setup (`inherit-parent`, role lines in OptChat's instructions; the setup skill's name and its models block are retired names, caught by the branding check) or fall back to the host's default model (`omit model`, "runs on the host's preferred model"), from `scripts/model-patterns.mjs`, with fixtures in `check-port.test.mjs`; the fixtures also run the whole checker on a scratch copy with the setup skill's folder restored, with setup wording added, with a host-default fallback added, with a ported LICENSE deleted or changed, with the notice in THIRD_PARTY_NOTICES.md changed, and with a `cube-adapt` note added, and each fails. Same limit as the handoff rule: keyword checks |
| no port commentary | no installed file contains `cube-adapt`, and no installed Markdown file an M1-M13 label |
| no retired name | every path and every file in the repository, not only `skills/`, is checked for the two retired brand names and the original stack's name (only where no letter or digit precedes it, so the stacked-PR word "upstack" passes) in any casing, after NFKC folding and Cyrillic and Greek look-alike folding, with one punctuation or invisible character, or a hyphenated line break, allowed between letters (`scripts/branding-patterns.mjs`, fixtures in `check-port.test.mjs`). The only exemptions are outside identifiers listed by file in `EXTERNAL_IDENTIFIERS` (Naming). **Limit:** a substring check: a brand split by plain whitespace, encoded, or named by description passes, and an unrelated word that contains a brand fails |
| cube can read it | folder id, `name` = id, description 1-1024 characters, surface `thread`/`optchat`/`both`, no symlinks |
| cube can install it | at most 64 skills, 2000 files, 8 MiB |
| links resolve where installed | every relative Markdown link stays inside `skills/` and exists |
| OptChat reads it in one call | each SKILL.md listed to OptChat is at most 30,000 characters (`SKILL_PAGE`) |
| the handoff rule (M2, M3) | every installed Markdown file is scanned for known substitute wordings (sequential roles, a self-review label, a labeled self pass, "review your own diff", OptChat reading a diff), from `scripts/handoff-patterns.mjs`; regression fixtures (`node --test scripts/check-port.test.mjs`, also in CI) prove each known bad wording is caught and the port's own wordings are not; each of the 43 installed files whose original hands work to another agent (`HANDS_OFF`, computed from the baseline with `DELEGATES`) must name a handoff or OptChat. **Limit:** these are keyword checks. They keep known regressions out but cannot prove the rule; a substitute worded another way passes, so the rule still needs a semantic review |
| surface is read as YAML nests it | `metadata.cube.surface` by key path; comment lines are ignored |
| named sections resolve | a reference such as ``(`references/cube.md`, Handoff)``, `(briefing-a-thread, Models)` or "the Models section of `<path>`" names a heading or bold label of the file it points at (`scripts/sections.mjs`); a section that moves takes its references along |
| the role split | `briefing-a-thread` is listed to OptChat only and `cube-mode` to threads only; Models, Follow up, Independent review, Reading a report and Multi-thread workflows are headings in `briefing-a-thread` and nowhere else; it links every skill in `MULTI_THREAD`, and each of those says OptChat drives its threads; it keeps the preamble link, `memory_zoom` and the no-role-play rule, and `cube-mode-agent.md` keeps its role-only and handoff clauses (`REQUIRED`); the handoff patterns add one thread playing all of a workflow's roles, one thread given a whole workflow, and acting as the judge, and now scan cube's own skills too. Scratch-copy fixtures break each and see it fail. **Limit:** structure and keywords, not behavior: a real model may still ignore the brief |

The checks that compared the tree with the baseline (the manifest, every
upstream file mapped, `COVERAGE.md` current) went with the baseline.

## How cube finds these skills (M5, verified)

cube lists a skill to a thread when its surface is `thread` or `both`, to
OptChat when it is `optchat` or `both`, and to nobody when it has
`disable-model-invocation: true`; a hidden skill is still installed, and a
link `../<id>/SKILL.md` (a thread's file tools, or OptChat's
`skill(listed, "../<id>/SKILL.md")`) reaches it. Upstream hides 57 of its 58
skills so that the model loads them only through `/name` or through
cube-mode's routing. The port keeps that two-tier design and lists only the
entry points:

| listed to | skills |
| --- | --- |
| threads | `cube-mode`, `cube-help`, `typescript-best-practices`, plus cube's `opening-a-pull-request`, `prove-it-works` |
| OptChat | `cube-help`, plus cube's `briefing-a-thread` (Role split) |
| nobody (installed; reached by link) | the other 54 |

Measured with cube's own resolver (below), before the role split: the
thread prompt's skill section was 2,376 bytes and OptChat's 1,923 bytes.
`skill("how")` is refused (not listed) and `skill("<listed>", "../how/SKILL.md")`
returns it; since the role split OptChat reads through
`skill("briefing-a-thread", "../how/SKILL.md")`, as `references/cube.md` says.

## The mapping rules

`skills/cube-mode/references/cube.md` states each rule operationally, as
tables an agent applies. This is the reasoning behind each.

**M1. One lead, two agents.** The original stack's lead is a chat that both judges and
acts: it plans, reads code, runs repros and spawns delegates. Cube divides
that by capability: OptChat holds the conversation, the user's grants and
every thread, but has no machine; a thread has a machine and one task, but
no view of other work. The abstraction the stack depends on is not "a chat" but
*a place where judgment across pieces of work lives* and *a place where
execution with evidence lives*. So every step goes where its capability
lives: planning, routing, judging across pieces and landing order go to
OptChat; reading, running, editing and opening PRs go to a thread. Each
playbook names its home (briefing-a-thread's Pick the role table; Role split). The cost is a seam:
a playbook that spans both is split at the brief and the report.

**M2. Delegation without nesting, and no stand-ins.** The original stack's subagents are
the mechanism, not the goal; the goals are (a) keeping bulk out of the
deciding context, (b) parallel throughput, and (c) independence between the
author of a thing and its judge. Cube allows exactly one level of
delegation, OptChat to threads. The user ruled how a thread meets a step
that needs another agent: it never plays that agent, neither in parallel
nor in sequence, and never offers its own pass as a substitute. It reports
a **handoff** (the tasks as ready briefs, the evidence so far, and how its
own task continues) and ends its turn; OptChat starts each task as a fresh
thread and tells the reporting thread the results when its own task goes
on. A thread is still the delegate its brief names: it does that task end
to end, with its fixes, continuation and landing, and it may run
deterministic scripts (levers, not agents). This keeps all three goals
whole, (c) above all, since nothing counterfeits independence; the price is
a round trip through OptChat, and machines, wherever a fan-out is needed.
An earlier revision let a thread run roles in sequence and label its own
pass `self-review, not independent`; that is removed everywhere, and the
checker now refuses it.

**M3. Independence from fresh threads, including the lead's review.** A verifier, judge, adversary or
Comment Sicko is valuable because it did not write the thing. Cube's rule
that a review is done by a thread that neither wrote the change nor reviewed
something else is the same invariant, so these roles map directly to fresh
threads OptChat starts, with briefs that name what to judge and the criteria,
never the author's reasoning.

The lead's own review is part of this. The original stack's lead reviews and verifies
every change its delegate writes. In cube the implementing thread *is* the
delegate, and OptChat, the lead, has no machine and cannot open a diff, so
that review cannot stay with either of them. After pushing, the author
reports a review handoff: one ready brief for a fresh review-and-verification
thread (the PR, the exact head, the repro or measurement to rerun, the
playbook's criteria, never the author's reasoning) and ends its turn.
OptChat starts the reviewer, reads its verdict, and tells findings back to
the author, whose fixes are the same task; a new head gets a delta review
from the same reviewer. The author's own checks (tests, its own rerun, a
reread of the diff) stay, reported as author checks, never as the review.
Bug fix, Perf issue, Hillclimb (its kept commits), Refactoring and Feature
end in this handoff. An earlier revision of this port had the author review
itself in four of them; a delta review found it and it is fixed.

**M4. Models per role, chosen once, from the user's words.** The original stack picks
a model per role and varies effort per call, so that diverse panels stay
diverse and routine work stays cheap; the model setup skill writes the role table
once into an always-applied rule. In cube the only model choice is
`spawn`'s `model`, made by OptChat, once per thread. A first port kept the
table as a block the user pasted into OptChat's instructions file, since
OptChat cannot write it (the old gap G2); the user rejected that manual step.
The abstraction the stack needs is not a file but *a durable statement of the
user's model choice that the lead reads before each spawn*, and OptChat's
chat already is one: OptChat reads its view every turn and can zoom older
lines. So the role table is now the user's own words: OptChat takes the
newest statement that covers a spawn (general, per role, or for one task),
matches it in `projects` by provider and id, and asks when none covers it,
the model is missing or its start fails, or a newer general statement and an
older per-role one leave the intent unclear (no invented precedence). A
thread's handoff names the role and may quote the user's model words;
only OptChat picks the `provider/id`. Omitting `model` is no longer a
fallback: it picks the host default (Pi's default model, else the catalog's
first), which can be a provider the user ruled out, such as the Anthropic
API when they chose Opus through Claude Code. The original host's model slugs are never passed.
A panel is diverse only with families the user accepted, and a skill says so
when it is not. Lost: per-call effort and mid-task model changes; a fresh
chat asks once before its first spawn. This rule holds where OptChat reads
cube-mode; a spawn outside it still follows cube's own default.

**M5. Discovery is explicit.** The original stack relies on its host's slash menu,
`disable-model-invocation`, custom modes, `alwaysApply` rules and path
globs. Cube has one automatic route (a listed description) and one explicit
route (a link from a skill that was read). The port keeps upstream's
two-tier design (few entry points, many hidden leaves) and moves each
trigger onto the route cube has: the user's words name a skill; cube-mode
and cube-help list every one; `typescript-best-practices` becomes listed
because its original trigger (a path glob) was automatic. The model setup skill, the
other always-applied skill, is retired (M4). A skill is loaded only when an agent decides to read it; nothing
guarantees it.

**M6. Questions are OptChat's.** The original stack's `AskQuestion` blocks a turn on
the human. In cube only OptChat talks to the user, and a thread that asks
must end its turn. The stack already wants questions rare (settle facts by
experiment, decide what a grant covers); the port keeps every rule about
when to ask, and maps the act of asking to OptChat in chat, or a thread's
report with options and a recommendation.

**M7. Waking up.** The original stack's `/loop`, watcher subagents and heartbeats
exist because the agent must notice an event later. In cube nothing wakes an
ended thread and OptChat never polls; OptChat's wake-ups are thread reports
and the user's messages. So a wait inside a task is a bounded foreground
wait the thread repeats (a command runs at most 10 minutes); a run across
tasks is driven by OptChat, one report at a time; and a process that must
outlive a command is a `cube service`, only when the brief allows. Lost: a
timed audit. A thread that stalls silently is noticed at the next report or
message, not on the hour.

**M8. Continuity.** The original stack gives a fix round to a fresh subagent because
interrupt-chained resumes drop directives. Cube keeps a task's own steps
(fixes, review findings on its PR, landing) with the author thread, which
holds the checkout, and gives every new task a fresh thread. Both aim at the
same invariant, that the agent doing the work has the complete current
directive. The port takes cube's routing and keeps the original stack's safeguard: each
tell restates every directive still open.

**M9. Authority.** The original stack's Autonomy section says "just do it" for
reversible work and "always pause" for irreversible writes. Cube adds scope:
a grant reaches exactly as far as the user said, a thread's authority is its
brief, and a report never grants. The port keeps the original stack's split and its
anti-sycophancy rule, adds cube's reserved actions to the pause list
(default-branch pushes, tags, releases, restarts, host access, paid probes,
settings, hooks), and carries the earlier port's reviewed rules on standing
grants and instruction precedence.

**M10. Records.** The original stack reads transcripts, keeps program state in a
tracker and trails in an agent store. Cube's records are OptChat's chat
(`zoom`, `date`; threads read it with memory tools), each thread's
conversation (OptChat's `history`), artifacts, and git. A file in a thread's
machine is not a record: it leaves with the thread, and no other thread sees
it. So every record a later agent needs goes to an artifact, a pushed branch
or the report, and the user's chat with OptChat becomes `why`'s real-time
chat source (`why/references/sources/optchat-chat.md`).

**M11. Environment.** A thread is one VM with one checkout, HTTP(S) only,
no real secrets; installed skills are replaced at each start; project skills
live in `.agents/skills`. Paths, isolation (worktrees, cloud VMs) and tool
prerequisites map onto that. Measured: `bun` (for `watch-pr`) and `mise`
(for `statechart`) install in a thread machine; Tailscale (UDP) and a webhook
sender key (a secret) cannot be there.

**M12. Features cube lacks.** The original host's products: its review bot,
Automations, `SendToUser`, a separate team plugin (`deslop`, `control-ui`,
`control-cli`), `create-skill`,
Plan Mode, `/visualize`, image generation, canvases. Where cube has an
equivalent the step uses it (GitHub review threads, the project's
`verify-*` skill or a real browser, Mermaid in artifacts, the Authoring a
skill playbook); otherwise the step is skipped with one line, `Skipped in
cube: <step>. <reason>.`, the convention upstream itself uses for Claude
Code.

**M13. Links.** A link out of an installed skill folder does not resolve
in cube. The original stack's README and guide are user documentation for the original
host: they stay in the baseline, and installed skills no longer link them.
cube-help points at the installed skills and playbooks that hold the same
answers, and cube.md maps the original stack's names.

## Coverage by skill

Files: upstream files in the skill / changed in the port. Every unchanged
file was byte-identical when the port was made; `COVERAGE.md` in the
baseline commit lists every file. The branding removal (Naming) later
changed a few more.

| skill | files | changed | listed | rules | in cube |
| --- | --- | --- | --- | --- | --- |
| cube-mode (renamed from upstream's router) | 43 | 30 (+3 new) | threads | M1-M13 | renamed (Naming); its review-bot rubric later removed (Naming); the router, now the thread's half only (Role split): Threads section, a home for each playbook, cube's pause list; playbooks mapped step by step; `check-plan.mjs` markers follow the adapted skeleton; adds `references/cube.md` and `agents/cube-mode-agent.md` |
| cube-help (renamed from upstream's help) | 3 | 3 | both | M1 M2 M4 M5 M7 M10-M13 | renamed (Naming); cube setup (default source, Settings pin, the three listed ported skills), models said in the chat, a request for model setup answered as needing none, modes, troubleshooting rows, links to installed playbooks in place of the guide |
| model setup skill | 1 | retired | | M4 | not installed (Retired); its original stays in the baseline |
| typescript-best-practices | 2 | 1 | threads | M5 | listed, since its original path glob was automatic |
| how | 3 | 1 | | M2 M4 | explorers and explainer are threads OptChat starts; a thread hands `how` off |
| why | 13 | 1 (+1 new) | | M2 M4 M10 M11 | investigators and synthesizer are threads; a thread builds the anchor and hands off; evidence sources cube has; adds the OptChat-chat source playbook |
| teach | 1 | 1 | | M2 M12 | how and why by handoff; no image generation |
| recall | 1 | 1 | | M1 M2 M10 | OptChat's chat and thread histories as the history; a thread searches one or two stretches itself and hands off the rest; live state by a thread |
| ketchup | 1 | 1 | | M1 M10 M12 | OptChat's skill; PR state as last reported, with time |
| ketchup-video | 1 | 1 | | M1 M11 M12 | rendered by a thread, linked (no inline video) |
| arena | 1 | 1 | | M1-M4 M11 | OptChat runs candidates and judge; a synthesis thread picks and grafts; a thread frames and hands off (no single-agent arena) |
| swarm | 1 | 1 | | M1 M2 M4 M11 | OptChat's; a thread frames and hands off |
| interrogate | 1 | 1 | | M1-M4 M11 | adversary threads on a pushed scope; a thread hands off |
| architect | 4 | 2 | | M2 M4 M6 M11 | arena by handoff; implements the sketch on the tell; checkpoint by report |
| reflect | 5 | 1 | | M2-M4 M6 M7 M9-M12 | digest in place of the transcript file; lenses and synthesizer are threads (handoff); a brief counts as use only when it directs a read of the skill; edits land as a PR in the skill's source, never merged |
| no-comments | 1 (+1 agent) | 1 (+1) | | M2 M3 M6 M9 M11 | Comment Sicko as a fresh thread committing to its own branch, by handoff; steps 2 to 6 continue on the tell |
| automate-me | 1 | 1 | | M1 M2 M5 M6 M10-M12 | OptChat mines and interviews, a thread drafts; mode skills listed, not hidden |
| figure-it-out | 1 | 1 | | M1-M3 | fan-out phases and judges by handoff |
| show-me-your-work | 3 | 1 | | M3 M4 M10 | trail kept in the report or an artifact; cross-model review by a thread OptChat starts |
| create-verification-skill | 4 | 1 | | M11 | `.agents/skills/verify-<app>/` |
| maintain-verification-skill | 1 | 1 | | M2 M6 M11 | one reader thread per feature by handoff |
| make-bot-ui | 1 | 1 | | M7 M11 M12 | stops: no cube wake endpoint, no secret in a machine, no Tailscale (gap G3); page via `cube service` |
| statechart | 407 | 1 | | M11 | install mise first; measured working |
| principle-build-the-lever | 1 | 1 | | M2 M5 | the lever is a committed file named in every brief |
| principle-guard-the-context-window | 1 | 1 | | M2 | bulk to threads (OptChat) or to scripts (a thread) |
| benchmark-checklist, blast-radius, bro, correct, create-formal-verification-skill, in-your-own-words, maintain-formal-verification-skill, sharpen, tdd, technical-writing, unslop, and the 22 other `principle-*` | 1 each | 0 | | | unchanged: nothing in them depends on the original host; hidden, as upstream |

Upstream's files outside `skills/` and `agents/` stay in the baseline only:
the README and the ten-page guide (user documentation for the original
host), the Claude Code adapter (cube.md is cube's), `automations/benny`
(two Automations triggered from Slack: cube has nothing that starts an
agent on an event, gap G3), and the plugin manifests and logo (cube installs
git folders, not plugins). `COVERAGE.md` in the baseline commit gives each
file's reason.

## The earlier port

`directing-the-work` (OptChat) and `working-the-task` (threads), merged in
`e893ef97` and never activated, were a two-skill summary of the original stack's router. They
are removed; cube-mode replaces them, and their reviewed rules moved here:

| earlier rule | now |
| --- | --- |
| route by task kind, the deliverable and what the thread may change | cube-mode's playbook list and home table |
| permissions reach exactly as far as the user said; standing grants; reports never grant | cube.md, Authority (M9); cube-mode Autonomy |
| attack the premise; settle facts by experiment | cube-mode Non-negotiables and principles, unchanged |
| brief: kind, grants, evidence, test bar, stop | cube-mode Threads (OptChat) and cube.md Delegation |
| read a report as evidence; check the pins | cube.md, Reading a report |
| review by a thread that wrote nothing; findings to the author; landing in the author thread | cube.md M3, M8; Shipping step 4 |
| precedence: system, task (newest first, within its authority), repository, skill | cube.md, Authority |
| wait in the foreground; promise no later work | cube.md M7 and the report format |
| thread report: outcome, pins, evidence, facts/hypotheses/unknowns, gaps, decisions | cube.md, the report |
| its seven playbooks | cube-mode's 23 playbooks |

## Verification

The port as first merged, run in a cube thread machine (Linux, node 26)
against that branch's commit; the branding removal's own checks are in its
pull request. No model was called: none of this shows how a model behaves with these
skills.

| what | how | result |
| --- | --- | --- |
| baseline fidelity | `git ls-tree -d b052d0d2 upstream/`, sha256 manifest | tree `4719e1c4` = upstream; 573/573 hashes match |
| completeness, no port commentary, cube rules, links, limits, handoff rule, model rule | `node scripts/check-port.mjs` | ok: 593 mapped files (64 adapted, 529 unchanged), 2 added, 1 retired skill, 60 skills, 87 links |
| cube resolves it | cube's `resolveSkills` (packages/server/src/skills.ts at `6c6ff59c`) on this repository at the commit | 60 skills, 0 skipped; YAML comments in frontmatter parse |
| cube lists it | `skillsPrompt`, `optchatSkillsPrompt` | as the table above |
| cube installs it | `skillInstallScripts` run in bash, as a thread machine runs them, fetching the pushed head from GitHub over HTTPS | 2,486-byte script (limit 8,192); installed tree equals `skills/` byte for byte, exec bits too |
| OptChat reads it | cube's `optchatSkills().read` | cube-mode, cube-help, `../how/SKILL.md`, `references/cube.md`, playbooks read; the setup skill's `SKILL.md` and a hidden id by name are refused |
| cube's own skills tests | `node packages/server/test/skills-test.ts` | ok (unchanged code) |
| check-plan | `bun test check-plan.test.ts` (adapted fixture) | 7 pass |
| watch-pr | `bun test watch-pr`; `watch-pr --owner cubeyard --repo cube --pr 311 --status-only` | 54 pass; real PR read as merged |
| bun in a thread | `npm install -g bun` | bun 1.4.4 |
| statechart | mise install, then `scripts/statechart` on the Counter corpus spec | Java and TLC installed by mise; chart equals the corpus chart |
| worktree-audit | on a scratch clone with one worktree | classified; transcript scan skipped |
| show-me-your-work log.sh | one row with a formula-like cell | written, cell quoted |
| with the old source still configured | `resolveSkills` with the original stack's source (`df581122`) after the default | 63 skills; 48 ported skills overridden by the originals, and the original router, help and the model setup skill back beside `cube-mode` and `cube-help` (gap G1) |

## Gaps and product changes

None of these is in this PR. Each needs a decision or a cube change.

| | gap | effect | what would close it |
| --- | --- | --- | --- |
| G1 | a cube that added the original stack's repository (`df581122`, its skills folder) as a skills source keeps it after the default updates; the last source wins | 48 of the ported skills (all but `cube-mode` and `cube-help`) would be replaced by the unported originals, and the original router, help and the model setup skill come back beside them, under their old names: 63 ids (measured with cube's resolver after the retirement) | the user removes that source in Settings, Skills, when activating |
| G2 | closed: no model setup is needed | the model setup skill is retired; OptChat reads model preferences from the chat (M4) | nothing |
| G3 | nothing starts or wakes an agent on an event (webhook, schedule, Slack) | `automations/benny` is not ported; `make-bot-ui` stops; audits run at reports, not on the hour | an authenticated wake endpoint whose credential stays in cube's gateway, or scheduled ticks |
| G4 | OptChat cannot read PR, CI or diff state, nor stop a working thread | Orchestrate and ketchup state PR status as last reported; a looping thread can only be told to stop | read-only forge status for OptChat; a stop tool |
| G5 | a thread cannot read its own transcript | reflect and the show-me-your-work audit work from a digest | a read-only transcript tool for a thread's own conversation |
| G6 | reasoning effort is not settable per thread | budgets map to model choice only | per-spawn effort |
| G7 | chat and artifacts cannot play video, and show images as links | ketchup-video and review gates link media | inline media in artifacts |
| G8 | 60 of the 64 skills a thread can install are used | a user's own sources can add at most 4 new ids (or must disable some) | a higher limit, or hidden skills not counted |
| G9 | no live model run | how well OptChat and threads follow these skills, and how reliably threads hand off instead of doing a fan-out themselves, is unmeasured | real runs after activation |
| G10 | closed: the baseline left the tree (Baseline) | a depth-1 fetch no longer carries the 573 baseline files; it carried them from the first port until the branding removal | nothing |

## Retired

The model setup skill asked for a reasoning budget, mapped a model to each role,
and wrote the result into an always-applied rule. In cube that rule could
only be a block the user pasted by hand into OptChat's instructions file
(the old G2), and the user rejected that: no new configuration storage, no
manual file editing, no settings editor. Porting it some other way would add
a store cube does not need, so it is retired instead (**Subtract Before You
Add**), and cube-mode's M4 reads the user's own words in the chat. What
setup did, and where it went:

| setup step | in cube |
| --- | --- |
| detect models | OptChat matches the preference in `projects`, by provider and id (M4) |
| load current state, re-runs replace | the newest statement in the chat wins; a later one replaces it |
| budget, per-role map, confirm | the user's words, general or per role; "cheaper" or "strongest" picks among the models they cover; OptChat asks when none covers a spawn |
| validate | a model not in `projects`, or one whose start fails, makes OptChat ask; no silent fallback |
| write the rule | nothing to write; the chat is the record |
| offer a verification and a formal verification skill | unchanged skills (`create-verification-skill`, `create-formal-verification-skill`, their `maintain-*`), offered by cube-mode's UI/CLI gate and cube-help's state checks when the question calls for them |

Its name is a retired name (Naming): `scripts/check-port.mjs` fails on a
folder, path or text that names it, so it cannot come back and installed
text cannot send anyone to it. A user who asks for a model setup command
reaches `cube-help`, which says it is retired and how to
state a preference.

## Role split

The original router is one skill for one lead. The port first kept it whole
and gave OptChat and a thread each a half inside it (M1), with OptChat's
rules also spread over `references/cube.md`. The user saw the cost: OptChat
read cube-mode and its principles for work it never does, and a thread got
none of what OptChat read. The user's decision: OptChat's whole part lives
in `briefing-a-thread`, and cube-mode is the thread's working method. No new
umbrella skill, no copied rule sets.

| responsibility | before | after |
| --- | --- | --- |
| goal, decisions, history, model preference | cube-mode Threads, cube.md Models | briefing-a-thread: Before you spawn, Models |
| role and playbook routing | cube-mode Playbooks table | briefing-a-thread: Pick the role |
| multi-thread workflows (arena, architect, swarm, how, why, interrogate, reflect, ...) | each skill's own In cube text, cube.md "In OptChat" | briefing-a-thread: Multi-thread workflows (the one owner); each skill keeps its own stages and says OptChat drives them |
| the brief: role, leaf skills, decisions, grants, evidence, the chat view | briefing-a-thread (four bullets), cube-mode Threads | briefing-a-thread: Write the brief, with `cube-mode-agent.md` naming the role |
| follow-up, fresh threads, tells | cube-mode Threads, cube.md Same task | briefing-a-thread: Follow up; cube.md keeps the thread's side |
| independent review, reading reports | cube-mode Threads, cube.md | briefing-a-thread: Independent review, Reading a report; cube.md keeps the author's review handoff |
| execution, principles, author checks, reports, handoffs | cube-mode, cube.md | unchanged: cube-mode and cube.md |
| shared name map, Authority, records, environment | cube.md | unchanged: cube.md, read by both |

Why each choice:

- **Surface, not prose.** `cube-mode` is now listed to threads only, so
  OptChat cannot load it as its own playbook by habit; it reaches a
  playbook file or a routed skill through `briefing-a-thread`'s links. That
  enforces the split in metadata instead of another instruction
  (**Encode Lessons in Structure**), and OptChat's listed skills drop from
  three to two.
- **One owner for orchestration.** A multi-thread workflow keeps its own
  stages in its skill; `briefing-a-thread` holds the generic driver steps
  once (spawn per role, gather, sequence, synthesize, follow up, review)
  and lists every such workflow, so neither a worker nor a copy elsewhere
  runs the whole thing.
- **Reads do not transfer.** The brief names the role and the leaf skills a
  thread must read; OptChat cites a principle only for its own decisions,
  and reports a thread's use of one only from that thread's report (the
  reflect synthesis that led here).
- **The chat view.** cube gives every new thread a frozen, coarse view of
  the chat and `memory_zoom`/`memory_date` (cubeyard/cube
  `packages/server/src/thread-memory.ts`, `docs/optchat.md`, "The chat in
  threads"), as context, never instructions. So a brief states every
  binding decision itself and points to message ids and artifacts for the
  rest, instead of copying history.
- **No ceremony.** No mandatory principle reading for OptChat, and no
  audit of every principle a report cites.

## Naming

The user first asked to adapt *and rename* the original stack's router for cube, then
asked for every skill of the stack copied as is and converted. The options below
were put to the user, who chose **B**: the router is `cube-mode` in cube, and
every other skill keeps its upstream id. Later the user asked for the help
skill to match, and it is `cube-help`.

Then the user ruled that the two retired brand names (the author's handle
and the original host's name) are mentioned nowhere, and later that the
original stack's own name goes too, replaced by cube's terms: not as a trigger or
alias, not in a file or path name, not in docs, manifests, tests or the
reference copy. So the old slash commands no longer trigger anything (a user
types `/cube-mode` or `/cube-help`), the router's agent brief is
`agents/cube-mode-agent.md`, the script packages are `@cube-skill/*`, the
baseline left the tree (Baseline), and `scripts/check-port.mjs` refuses
any of the three in any path or file of the repository
(`scripts/branding-patterns.mjs`, which spells them backwards so it passes
its own check). Behavior that depended on the names keeps working:

| where | before | now |
| --- | --- | --- |
| cube-mode, cube-help descriptions | listed the old names as triggers | list only the cube names |
| cube-help | linked the original guide pages | links the installed playbooks, recipes and Principles that hold the same answers; the guide stays in the baseline |
| `worktree-audit.sh` | scanned the original host's transcript directory, which never exists in a thread machine | scans `WORKTREE_AUDIT_TRANSCRIPTS` when it is set; unset, the scan is skipped as before |
| `watch-pr` | internal page fields named after GraphQL's page field | `nextAfter`; the GraphQL query still reads GitHub's own field |
| `check-plan.mjs` | a loop index named for its job | `from` |
| skill text naming the stack | the stack's name as a product ("its skills", "use it", "make it my own") | "cube-mode", "cube's skills", "the original stack" where the text is about the source; cube.md's tables say "skill term" |
| the model setup skill | named as retired in cube-help and cube.md, with a `RETIRED` check | not named; cube-help answers a request for model setup; the branding check keeps the name out, folder included |
| statechart recorded TLC logs | absolute paths of the author's checkout | the same paths under this repository's name; the parsers ignore them (same 264 pass before and after) |
| the original host's review bot | `watch-pr` recognised its threads (a per-thread flag, and a review-pass count from run ids) and rendered both; a triage rubric (`references/` in cube-mode) and Babysit, Multi-phase plan and cube-mode steps named it | removed entirely, as the user approved: review threads carry only `id` and `firstComment`, the watcher's pending review-automation check keeps its generic tokens, and every review comment, from a person or a bot, is triaged by Babysit step 8 (verify, fix with a red-first proof, dismiss with a concrete reason, or ask; escalate security, auth, billing, data and migrations). The guard keeps the bot's name, and so its old fields and rubric, out of the repository |

`EXTERNAL_IDENTIFIERS` lists by file the only matches the check allows:
GitHub GraphQL's `PageInfo` page field, in `watch-pr/github.ts` and its
recorded test responses, which a query must name to page through review
threads and checks. It is a protocol field, not branding, and renaming it
would break paging. The user chose to remove the original host's review
bot support entirely rather than exempt its identifiers.

What the resolver does (cubeyard/cube `packages/server/src/skills.ts`):
sources are read default first, then the user's in order; for each id **the
last source wins**; the union of ids after `skills.disabled` may hold at most
**64**, or every thread start is refused before a machine is allocated.

| option | what changes | with the original stack's source still configured | other costs |
| --- | --- | --- | --- |
| A. keep upstream ids (the port before the user chose) | nothing | its 51 originals override the ported skills of the same id (silently, unported text); 61 ids, so starts still work | the ids carry the author's handle, not cube; diffs and future upstream updates stay one to one |
| B. rename only the entry router (chosen) to a cube name, `cube-mode`, keep the leaves | one folder renamed, its links and the mentions of the old command updated | 62 ids; the new router is kept, but the 50 other ported skills it links to are still overridden by the originals (measured) | the user-facing name changes |
| C. rename every skill (a prefix, e.g. `ported-how`) | 58 folders, every cross-link | no override, but the union is 61 + 51 = 112 ids, over 64: **every thread start fails** until the old source is removed or its skills disabled | the largest diff; ids get longer (install command grows, still under 8 KiB); upstream updates map by a rename table |
| D. keep ids, set display names | `name:` differs from the folder (cube shows it in Settings only) | as A | the model never sees display names; upstream itself renamed every skill to its folder name (#702) |

Under B, with the original stack's source still configured, `cube-mode`
itself is safe, but the original router comes back beside it (hidden,
unported text) and the 50 other ported skills it links to are the unported
originals (measured when B was chosen: 62 skills, 50 overridden; after
cube-help and the retirement, 63 and 48, G1). So the old source must still
go (G1), before or in the same save as the new default commit.

## Activating (not done here)

Merging changes nothing a cube runs until the user chooses the new commit in
Settings, Skills (check for update, then use that commit). In order:

1. Squash-merge, so the as-is copy commit never sits on main to be pinned.
2. Remove (or disable) the original stack's source (`df581122`) before, or in the
   same save as, the new default commit (G1; see Naming for why the order matters).
3. Keep the user's own sources to at most 4 new ids (G8), or every thread start fails.
4. Smoke-test with a real model: one OptChat turn and one thread with cube-mode (G9). New threads and OptChat's next turn then get it;
OptChat's prompt changes once (cache rewrite), with three more listed skills.
5. The role split changes OptChat's listed skills (cube-mode leaves its list) and every new thread's cube-mode text; smoke-test one OptChat turn that starts a cube-mode thread and one multi-thread workflow (G9).
