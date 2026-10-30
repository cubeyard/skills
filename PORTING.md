# Porting pstack to cube

pstack (poteto's agent stack, [cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack))
is a set of 58 skills and 2 agent definitions written for Cursor: one chat
that plans, spawns subagents on chosen models and reviews their work. This
repository ports all of it to cube, where that one chat becomes two agents:
OptChat, which directs and has no machine, and threads, which each do one
bounded task in their own machine and report. Nothing is dropped. Every skill
is here under its own id, with its references, scripts and assets, and every
change from the original is marked where it happens and justified.

## Layout

```text
upstream/pstack/        pstack as published, byte for byte (git tree 4719e1c4); never installed
upstream/pstack.sha256  sha256 of each of its 573 files
upstream/README.md      provenance: repository, commit, why this commit, how to update
skills/<id>/            what cube installs: 58 ported skills + cube's own 3
skills/poteto-mode/references/cube.md   the cube adapter every ported skill relies on (M1-M13)
scripts/check-port.mjs  the checks below; --matrix prints COVERAGE.md, --diff <id> shows a port
COVERAGE.md             every upstream file and where it went (generated)
THIRD_PARTY_NOTICES.md  pstack's MIT license, beside this repository's Apache-2.0
```

cube installs only `skills/` (the default source's `path`), so the originals
under `upstream/` can never reach a thread or OptChat, and the two copies can
be diffed at any time:

```sh
node scripts/check-port.mjs --diff how      # upstream/pstack/skills/how against skills/how
```

## Method

1. **Copy as is.** Commit 1 adds `upstream/pstack/` from
   `cursor/plugins@4dd1d058` (`git archive`), with a sha256 manifest. Its git
   tree equals upstream's `pstack/` tree, so fidelity is checkable with one
   command (`upstream/README.md`).
2. **Copy into place.** Every `upstream/pstack/skills/<id>/` is copied to
   `skills/<id>/` unchanged; the two agent definitions go into the skill that
   starts them (`poteto-mode/agents/poteto-agent.md`,
   `no-comments/agents/comment-sicko.md`), since cube has no agent definitions.
   pstack's `LICENSE` is copied into every ported folder, because cube
   installs each folder on its own.
3. **Adapt in place.** Each change is an edit at the spot it concerns, with
   a note right above it. A file that needs no change stays byte-identical
   (33 of the 58 skills are unchanged, and 540 of 595 mapped files).
4. **Check it mechanically** (`node scripts/check-port.mjs`, below), so that
   "no silent omission" is a test, not a promise.

### Notes

Every change from the baseline carries a note within 15 lines above it (or
above the fenced block it sits in), in the file's own comment syntax:
`<!-- cube-adapt ... -->` in Markdown, `# cube-adapt ...` in YAML
frontmatter and shell, `// cube-adapt ...` in TypeScript and JavaScript.
Each note gives five things, and the checker refuses a note that lacks one:

| label | says |
| --- | --- |
| `Intent:` | what the original was for, in pstack's own terms |
| `Cube:` | the cube fact that stops it working as written |
| `Kept:` | the principle that survives the change |
| `Now:` | the concrete mapping |
| `Cost:` | what is lost or what it costs |

The note cites the mapping rules (M1-M13, below) it applies. Notes are read
by the agents too: they explain the reason for an instruction at the place it
applies, which is what upstream's own authoring rule asks of a rule that would
be confusing without its reason.

### What the checker enforces

| check | how |
| --- | --- |
| the baseline is upstream | every file's sha256 against the manifest; the git tree of `upstream/pstack` equals `4719e1c4` |
| nothing is dropped | each of the 537 upstream skill and agent files, and the license in each of 58 folders, has its file under `skills/` |
| no silent change | `git diff --no-index -U0` per file; every hunk needs an own note in reach |
| every note is complete | the five labels |
| new files explain themselves | a file with no upstream counterpart needs a note |
| cube can read it | folder id, `name` = id, description 1-1024 characters, surface `thread`/`optchat`/`both`, no symlinks |
| cube can install it | at most 64 skills, 2000 files, 8 MiB |
| links resolve where installed | every relative Markdown link stays inside `skills/` and exists |
| OptChat reads it in one call | each SKILL.md listed to OptChat is at most 30,000 characters (`SKILL_PAGE`) |
| non-skill upstream files are accounted for | `--matrix` fails on one with no stated reason |

## How cube finds these skills (M5, verified)

cube lists a skill to a thread when its surface is `thread` or `both`, to
OptChat when it is `optchat` or `both`, and to nobody when it has
`disable-model-invocation: true`; a hidden skill is still installed, and a
link `../<id>/SKILL.md` (a thread's file tools, or OptChat's
`skill(listed, "../<id>/SKILL.md")`) reaches it. Upstream hides 57 of its 58
skills so that the model loads them only through `/name` or through
poteto-mode's routing. The port keeps that two-tier design and lists only the
entry points:

| listed to | skills |
| --- | --- |
| threads | `poteto-mode`, `poteto-help`, `typescript-best-practices`, plus cube's `opening-a-pull-request`, `prove-it-works` |
| OptChat | `poteto-mode`, `poteto-help`, `setup-pstack`, plus cube's `briefing-a-thread` |
| nobody (installed; reached by link) | the other 54 |

Measured with cube's own resolver (below): the thread prompt's skill section
is 2,376 bytes and OptChat's 1,923 bytes. `skill("how")` is refused (not
listed) and `skill("poteto-mode", "../how/SKILL.md")` returns it, as
`references/cube.md` tells OptChat to do.

## The mapping rules

`skills/poteto-mode/references/cube.md` states each rule operationally, as
tables an agent applies. This is the reasoning behind each.

**M1. One lead, two agents.** pstack's lead is a chat that both judges and
acts: it plans, reads code, runs repros and spawns delegates. Cube divides
that by capability: OptChat holds the conversation, the user's grants and
every thread, but has no machine; a thread has a machine and one task, but
no view of other work. The abstraction pstack depends on is not "a chat" but
*a place where judgment across pieces of work lives* and *a place where
execution with evidence lives*. So every step goes where its capability
lives: planning, routing, judging across pieces and landing order go to
OptChat; reading, running, editing and opening PRs go to a thread. Each
playbook names its home (poteto-mode's Playbooks table). The cost is a seam:
a playbook that spans both is split at the brief and the report.

**M2. Delegation without nesting.** pstack's subagents are the mechanism,
not the goal; the goals are (a) keeping bulk out of the deciding context,
(b) parallel throughput, and (c) independence between the author of a thing
and its judge. Cube allows exactly one level of delegation, OptChat to
threads. So: in OptChat, a pstack fan-out is a `spawn` with one task per
worker. In a thread, each role is run in order by the thread itself, with
files between roles so the next role reads the previous one's output rather
than its memory (which preserves (a)), and (b) is given up. Where (c) is the
whole point, the thread does not pretend: it runs the single-agent form,
labels it `self-review, not independent`, or reports the fan-out for OptChat.
Simulating several agents in one context and calling it independent is
forbidden, since it would counterfeit exactly the property the step exists
for.

**M3. Independence from fresh threads.** A verifier, judge, adversary or
Comment Sicko is valuable because it did not write the thing. Cube's rule
that a review is done by a thread that neither wrote the change nor reviewed
something else is the same invariant, so these roles map directly to fresh
threads OptChat starts, with briefs that name what to judge and the criteria,
never the author's reasoning.

**M4. Models per role, chosen once.** pstack picks a model per role and
varies effort per call, so that diverse panels stay diverse and routine work
stays cheap. In cube the only model choice is `spawn`'s `model`, made by
OptChat, once per thread. The role table survives intact as lines in the
user's OptChat instructions (written with `setup-pstack`); Cursor slugs are
never passed (they are not cube ids); `inherit-parent`/`auto` become "omit
the model". A panel is diverse only if the user configured distinct models,
and a skill says so when it is not. Lost: per-call effort and mid-task model
changes.

**M5. Discovery is explicit.** pstack relies on Cursor's slash menu,
`disable-model-invocation`, custom modes, `alwaysApply` rules and path
globs. Cube has one automatic route (a listed description) and one explicit
route (a link from a skill that was read). The port keeps upstream's
two-tier design (few entry points, many hidden leaves) and moves each
trigger onto the route cube has: the user's words name a skill; poteto-mode
and poteto-help list every one; `setup-pstack` and `typescript-best-practices`
become listed because their Cursor triggers (always-applied, path glob) were
automatic. A skill is loaded only when an agent decides to read it; nothing
guarantees it.

**M6. Questions are OptChat's.** pstack's `AskQuestion` blocks a turn on
the human. In cube only OptChat talks to the user, and a thread that asks
must end its turn. pstack already wants questions rare (settle facts by
experiment, decide what a grant covers); the port keeps every rule about
when to ask, and maps the act of asking to OptChat in chat, or a thread's
report with options and a recommendation.

**M7. Waking up.** pstack's `/loop`, watcher subagents and heartbeats
exist because the agent must notice an event later. In cube nothing wakes an
ended thread and OptChat never polls; OptChat's wake-ups are thread reports
and the user's messages. So a wait inside a task is a bounded foreground
wait the thread repeats (a command runs at most 10 minutes); a run across
tasks is driven by OptChat, one report at a time; and a process that must
outlive a command is a `cube service`, only when the brief allows. Lost: a
timed audit. A thread that stalls silently is noticed at the next report or
message, not on the hour.

**M8. Continuity.** pstack gives a fix round to a fresh subagent because
interrupt-chained resumes drop directives. Cube keeps a task's own steps
(fixes, review findings on its PR, landing) with the author thread, which
holds the checkout, and gives every new task a fresh thread. Both aim at the
same invariant, that the agent doing the work has the complete current
directive. The port takes cube's routing and keeps pstack's safeguard: each
tell restates every directive still open.

**M9. Authority.** pstack's Autonomy section says "just do it" for
reversible work and "always pause" for irreversible writes. Cube adds scope:
a grant reaches exactly as far as the user said, a thread's authority is its
brief, and a report never grants. The port keeps pstack's split and its
anti-sycophancy rule, adds cube's reserved actions to the pause list
(default-branch pushes, tags, releases, restarts, host access, paid probes,
settings, hooks), and carries the earlier port's reviewed rules on standing
grants and instruction precedence.

**M10. Records.** pstack reads transcripts, keeps program state in a
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

**M12. Cursor-only products.** Bugbot, Automations, `SendToUser`,
`cursor-team-kit` (`deslop`, `control-ui`, `control-cli`), `create-skill`,
Plan Mode, `/visualize`, image generation, canvases. Where cube has an
equivalent the step uses it (GitHub review threads, the project's
`verify-*` skill or a real browser, Mermaid in artifacts, the Authoring a
skill playbook); otherwise the step is skipped with one line, `Skipped in
cube: <step>. <reason>.`, the convention upstream itself uses for Claude
Code.

**M13. Links.** A link out of an installed skill folder does not resolve
in cube. Links to pstack's README and guide point at the pinned public copy
(`cursor/plugins@4dd1d058`); the guide stays in the baseline (it is Cursor
user documentation, and cube.md maps its names).

## Coverage by skill

Files: upstream files in the skill / changed in the port. Every unchanged
file is byte-identical. `COVERAGE.md` lists every file.

| skill | files | changed | listed | rules | in cube |
| --- | --- | --- | --- | --- | --- |
| poteto-mode | 43 | 26 (+3 new) | both | M1-M13 | the router: Threads section (OptChat half, thread half), a home for each playbook, cube's pause list; playbooks mapped step by step; `check-plan.mjs` markers follow the adapted skeleton; adds `references/cube.md` and `agents/poteto-agent.md` |
| poteto-help | 3 | 3 | both | M1 M2 M4 M5 M7 M10-M13 | cube setup (default source, Settings pin, the four listed skills), modes, troubleshooting rows, pinned guide links |
| setup-pstack | 1 | 1 | OptChat | M1 M4 M5 M6 M10 | models from `projects`; the role block goes in OptChat's instructions file, which the user saves (gap G2) |
| typescript-best-practices | 2 | 1 | threads | M5 | listed, since its Cursor path glob was automatic |
| how | 3 | 1 | | M2 M4 | explorers and explainer: threads in OptChat, ordered passes with files in a thread |
| why | 13 | 1 (+1 new) | | M2 M4 M10 M11 | the same split; evidence sources cube has; adds the OptChat-chat source playbook |
| teach | 1 | 1 | | M2 M12 | how and why in order; no image generation |
| recall | 1 | 1 | | M1 M2 M10 | OptChat's chat and thread histories as the history; live state by a thread |
| ketchup | 1 | 1 | | M1 M10 M12 | OptChat's skill; PR state as last reported, with time |
| ketchup-video | 1 | 1 | | M1 M11 M12 | rendered by a thread, linked (no inline video) |
| arena | 1 | 1 | | M1-M4 M11 | OptChat runs candidates and judge; a synthesis thread picks and grafts; an in-thread form labeled self-review |
| swarm | 1 | 1 | | M1 M2 M4 M11 | OptChat's; a thread runs coverage slices in order |
| interrogate | 1 | 1 | | M1-M4 M11 | adversary threads on a pushed scope; one labeled pass in a thread |
| architect | 4 | 2 | | M2 M4 M6 M11 | arena per its cube section; checkpoint by report |
| reflect | 5 | 1 | | M2-M4 M6 M7 M9-M12 | digest in place of the transcript file; lenses as threads or passes; edits land as a PR in the skill's source, never merged |
| no-comments | 1 (+1 agent) | 1 (+1) | | M2 M3 M6 M9 M11 | Comment Sicko as a fresh thread committing to its own branch, or a labeled self pass |
| automate-me | 1 | 1 | | M1 M2 M5 M6 M10-M12 | OptChat mines and interviews, a thread drafts; mode skills listed, not hidden |
| figure-it-out | 1 | 1 | | M1-M3 | fan-out marked for OptChat; judge threads |
| show-me-your-work | 3 | 1 | | M3 M4 M10 | trail kept in the report or an artifact; cross-model review by a thread OptChat starts |
| create-verification-skill | 4 | 1 | | M11 | `.agents/skills/verify-<app>/` |
| maintain-verification-skill | 1 | 1 | | M2 M6 M11 | source wave in order or as threads |
| make-bot-ui | 1 | 1 | | M7 M11 M12 | stops: no cube wake endpoint, no secret in a machine, no Tailscale (gap G3); page via `cube service` |
| statechart | 407 | 1 | | M11 | install mise first; measured working |
| principle-build-the-lever | 1 | 1 | | M2 M5 | the lever is a committed file named in every brief |
| principle-guard-the-context-window | 1 | 1 | | M2 | bulk to threads (OptChat) or to scripts (a thread) |
| benchmark-checklist, blast-radius, bro, correct, create-formal-verification-skill, in-your-own-words, maintain-formal-verification-skill, sharpen, tdd, technical-writing, unslop, and the 22 other `principle-*` | 1 each | 0 | | | unchanged: nothing in them depends on Cursor; hidden, as upstream |

Upstream's files outside `skills/` and `agents/` stay in the baseline only:
the README and the ten-page guide (Cursor user documentation, linked at the
pinned commit), the Claude Code adapter (cube.md is cube's), `automations/benny`
(two Cursor Automations triggered from Slack: cube has nothing that starts an
agent on an event, gap G3), and the plugin manifests and logo (cube installs
git folders, not plugins). `COVERAGE.md` gives each file's reason.

## The earlier port

`directing-the-work` (OptChat) and `working-the-task` (threads), merged in
`e893ef97` and never activated, were a two-skill summary of poteto-mode. They
are removed; poteto-mode replaces them, and their reviewed rules moved here:

| earlier rule | now |
| --- | --- |
| route by task kind, the deliverable and what the thread may change | poteto-mode's playbook list and home table |
| permissions reach exactly as far as the user said; standing grants; reports never grant | cube.md, Authority (M9); poteto-mode Autonomy |
| attack the premise; settle facts by experiment | poteto-mode Non-negotiables and principles, unchanged |
| brief: kind, grants, evidence, test bar, stop | poteto-mode Threads (OptChat) and cube.md Delegation |
| read a report as evidence; check the pins | cube.md, Reading a report |
| review by a thread that wrote nothing; findings to the author; landing in the author thread | cube.md M3, M8; Shipping step 4 |
| precedence: system, task (newest first, within its authority), repository, skill | cube.md, Authority |
| wait in the foreground; promise no later work | cube.md M7 and the report format |
| thread report: outcome, pins, evidence, facts/hypotheses/unknowns, gaps, decisions | cube.md, the report |
| its seven playbooks | poteto-mode's 23 playbooks |

## Verification

Run in a cube thread machine (Linux, node 26) against the branch's commit.
No model was called: none of this shows how a model behaves with these
skills.

| what | how | result |
| --- | --- | --- |
| baseline fidelity | `git rev-parse HEAD:upstream/pstack`, sha256 manifest | tree `4719e1c4` = upstream; 573/573 hashes match |
| completeness, notes, cube rules, links, limits | `node scripts/check-port.mjs` | ok: 595 mapped files (55 adapted, 540 unchanged), 2 added, 61 skills, 87 links |
| cube resolves it | cube's `resolveSkills` (packages/server/src/skills.ts at `6c6ff59c`) on this repository at the commit | 61 skills, 0 skipped; YAML comments in frontmatter parse |
| cube lists it | `skillsPrompt`, `optchatSkillsPrompt` | as the table above |
| cube installs it | `skillInstallScripts` run in bash, as a thread machine runs them, fetching the pushed head from GitHub over HTTPS | 2,486-byte script (limit 8,192); installed tree equals `skills/` byte for byte, exec bits too |
| OptChat reads it | cube's `optchatSkills().read` | poteto-mode, `../how/SKILL.md`, `references/cube.md`, playbooks, setup-pstack read; a hidden id by name is refused |
| cube's own skills tests | `node packages/server/test/skills-test.ts` | ok (unchanged code) |
| check-plan | `bun test check-plan.test.ts` (adapted fixture) | 7 pass |
| watch-pr | `bun test watch-pr`; `watch-pr --owner cubeyard --repo cube --pr 311 --status-only` | 54 pass; real PR read as merged |
| bun in a thread | `npm install -g bun` | bun 1.4.4 |
| statechart | mise install, then `scripts/statechart` on the Counter corpus spec | Java and TLC installed by mise; chart equals the corpus chart |
| worktree-audit | on a scratch clone with one worktree | classified; transcript scan skipped |
| show-me-your-work log.sh | one row with a formula-like cell | written, cell quoted |
| with the old source still configured | `resolveSkills` with cursor/plugins@df581122 after the default | 51 ported skills overridden by the originals (gap G1) |

## Gaps and product changes

None of these is in this PR. Each needs a decision or a cube change.

| | gap | effect | what would close it |
| --- | --- | --- | --- |
| G1 | a cube that added cursor/plugins (`df581122`, `pstack/skills`) as a skills source keeps it after the default updates; the last source wins | 51 of the ported skills would be replaced by the unported originals | the user removes that source in Settings, Skills, when activating |
| G2 | OptChat cannot write its instructions file | `setup-pstack` hands the user a block to paste into `<CUBED_STATE>/optchat/AGENTS.md` | a settings field or tool for OptChat's instructions |
| G3 | nothing starts or wakes an agent on an event (webhook, schedule, Slack) | `automations/benny` is not ported; `make-bot-ui` stops; audits run at reports, not on the hour | an authenticated wake endpoint whose credential stays in cube's gateway, or scheduled ticks |
| G4 | OptChat cannot read PR, CI or diff state, nor stop a working thread | Orchestrate and ketchup state PR status as last reported; a looping thread can only be told to stop | read-only forge status for OptChat; a stop tool |
| G5 | a thread cannot read its own transcript | reflect and the show-me-your-work audit work from a digest | a read-only transcript tool for a thread's own conversation |
| G6 | reasoning effort is not settable per thread | budgets map to model choice only | per-spawn effort |
| G7 | chat and artifacts cannot play video, and show images as links | ketchup-video and review gates link media | inline media in artifacts |
| G8 | 61 of the 64 skills a thread can install are used | a user's own sources can add at most 3 new ids (or must disable some) | a higher limit, or hidden skills not counted |
| G9 | no live model run | how well OptChat and threads follow these skills, and how often the in-thread forms are chosen, is unmeasured | real runs after activation |
| G10 | each thread now installs 601 files, 3.6 MB, from a repository whose depth-1 fetch also carries the baseline | one run each in a thread machine: the depth-1 fetch took 975 ms and 3.4 MB at this head, against 568 ms and 140 KB at the current pin (`d5041ce9`); not repeated, so the spread is unknown | if it matters, move the baseline to its own branch or repository |

## Activating (not done here)

Merging changes nothing a cube runs until the user chooses the new commit in
Settings, Skills (check for update, then use that commit), and removes the
old pstack source (G1). New threads and OptChat's next turn then get it;
OptChat's prompt changes once (cache rewrite), with three more listed skills.
