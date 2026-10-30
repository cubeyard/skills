# pstack in cube

pstack skills were written for Cursor. In cube, read this file once per
task, then map each Cursor name in a skill with the tables below. Where a
skill's text already names the cube tool or agent, follow the skill.

## Who you are

pstack has one "parent chat" that plans, spawns subagents and reviews their
work. Cube has two agents. Find yours first: a thread's prompt says it was
started by OptChat and its final reply is its report; OptChat's prompt
says it is OptChat.

| pstack | OptChat (the user's chat) | a thread |
| --- | --- | --- |
| the parent chat that owns a playbook, the todo list and every spawn | yes: it routes, briefs, reads reports, decides the next step | no |
| a subagent, delegate, worker, owner, verifier, judge | no: it never writes code, runs commands or touches files | yes: one task, in its own machine |
| "spawn N in one message" | `spawn` with N tasks in one call | not possible: report a handoff (see Handoff) |
| the human, the operator | the user, in the chat | the user only through OptChat |

A playbook step that plans, routes, judges or lands across
several pieces of work belongs to OptChat. A step that reads code, runs a
command, edits files or opens a pull request belongs to a thread. When a
playbook's lead "delegates implementation to a subagent", in cube the
lead's judgment is OptChat's brief and the delegate is the thread you are
in, or the thread OptChat starts.

## Tools

| Cursor | cube |
| --- | --- |
| `Task` (spawn a subagent) | OptChat: `spawn({tasks: [{project, task, model?}]})`, one thread per task; its report comes back as `[id] ...`. A thread: none (see Handoff). |
| A follow-up to a running subagent, `resume` | OptChat: `tell(id, message)` for the same task only (see Same task, same thread). |
| `AskQuestion` | OptChat: ask in the chat in plain text, with the options listed. A thread: never waits; it ends its turn with the question and its recommendation in its report (see Questions). |
| Open a todolist | A thread: the agent's todo tool if it has one, else keep the list in your reply. OptChat: keep the list in your reply or in an artifact you revise. |
| Run another pstack skill (`/name`, "the **name** skill") | A thread: read `~/.cube/skills/<name>/SKILL.md` (or `../<name>/SKILL.md` from a skill) with your file tool. OptChat: `skill("cube-mode", "../<name>/SKILL.md")`. Hidden skills are installed but not listed. |
| `Grep`, `Glob` | `rg` and `find` in a thread's shell. |
| "Use any MCP tool" | A thread has cube's own tools (artifacts, OptChat's memory read only), `gh` and `git` with cube's credentials, and HTTP(S). Other MCP servers are not there: say which evidence that leaves out. |

## Subagent fields

Each row says what the field was for, and what carries that purpose in
cube. A field with no row: drop it and say so.

| Cursor field | purpose | cube |
| --- | --- | --- |
| `subagent_type: poteto-agent` | the delegate reads cube-mode first | the brief says "read `~/.cube/skills/cube-mode/SKILL.md` in full first": [`../agents/poteto-agent.md`](../agents/poteto-agent.md) is the template |
| `subagent_type: comment-sicko` | a reviewer that did not write the comments | a fresh thread briefed with [`../../no-comments/agents/comment-sicko.md`](../../no-comments/agents/comment-sicko.md) (see Independent review) |
| `subagent_type: generalPurpose` | a plain worker | a thread whose brief is the worker prompt |
| `readonly: true` | the worker must not write | the brief says "read only: no edits, no branch, no pull request"; the thread checks `git status` before reporting |
| `readonly: false` "for MCP access" | keep tools | every thread has the same tools; nothing to set |
| `environment: "cloud"` | its own machine and checkout | every thread already is one: its own VM, a fresh checkout of one project |
| `environment: "local"` | reach the user's computer | not available: a thread never reaches the user's computer. A `runner` named by the user is the only exception (an unsandboxed host runner), and only when the user asks for it |
| `cloud_base_branch: <b>` | start from a pushed branch | the brief names the branch or commit to check out first |
| `run_in_background: true` | don't hold the parent's turn | always so: OptChat's `spawn` returns at once and reports arrive later; OptChat never waits or polls (see Waiting) |
| `file_attachments` | give the worker files | name repository paths, pull requests or artifact ids in the brief; a thread cannot read another thread's files |
| `model` | the role's model | `model` on OptChat's `spawn` task, from the user's words in the chat (see Models); a thread cannot choose its own |

## Models

Only OptChat chooses a model, once per thread, with `spawn`'s `model`
(`provider/id`, as `projects` lists them). There is no setup and no file:
a role's line is what the user said in the chat about the models that
cover that spawn.

1. **Find it.** Read the current view for models, providers or families
   the user asked for or ruled out: in general, for a role (`bug-fix`,
   `arena runners`), or for this task. Zoom a line that mentions one when
   its summary is too coarse to name the provider. The newest statement
   that covers the spawn wins; one said for a task ends with that task.
   When a newer general statement and an older one for this role leave
   the user's intent unclear (did "use Y" replace "bug-fix on X"?), ask;
   do not invent a precedence.
2. **Match it exactly.** Find the model in `projects` by provider and id.
   The same model name under another provider is another choice: "Opus
   through Claude Code, not the API" is the Claude Code provider's Opus,
   never the Anthropic API's.
3. **Ask when it does not hold.** No statement covers the spawn, the
   preferred model is not in `projects` or its start fails, or two
   statements conflict: ask the user, with a proposal from `projects`,
   before you spawn. The answer is the preference from then on; nothing
   else stores it.
4. **No silent fallback.** Never switch provider or family on your own,
   and never read availability as consent. Raise or lower only among the
   models the user's words cover. Never omit `model` to dodge the
   question: the host default can be any model.
5. **Panels.** A panel (arena runners, interrogate reviewers) keeps its
   point, diverse families, only with families the user accepted. With
   one, it is N independent tries on that model, and the report says so.
   A seat that must be of another family (a cross-judge, a verifier) and
   that no accepted family fills: skip it where the skill allows a skip
   (arena's judge), and say so; otherwise ask.
6. **Say it.** In the reply, name the model each spawn got and the
   message it follows, so the user can correct it.

- `/setup-pstack` is retired in cube: there is nothing to run or save.
- A Cursor slug (`claude-opus-5-5-xhigh`, `grok-4.7-xhigh-fast`) is not a
  cube model id. Never pass one.
- Reasoning level and fast or standard speed are part of the model id
  only where the provider offers them as models; otherwise they are not
  settable per thread. Say so rather than invent an id.
- A thread runs on the model it was started with; it never switches. A
  thread's handoff names the role for each task and may quote the user's
  model words for it verbatim; it never picks a `provider/id`. OptChat
  resolves the model here.

## Delegation

### Handoff

A thread never stands in for another agent. A thread is the agent
its brief makes it: the delegate pstack's lead hands a task to (the
implementer of a bug fix, feature, refactor, perf change or hillclimb
attempt; a verifier; an explorer; a reviewer). It does that task itself,
start to end, including the lead's hands-on steps (reproduce, verify,
check its own diff before pushing, an author check that never stands in
for the independent review, which is a handoff: see Independent review) and the task's own continuation,
fixes and landing.

Wherever a skill, playbook or template requires *another* agent (spawn,
fan out, delegate, a subagent, a worker, a judge, a verifier, a reviewer
that did not write the work, a second model), the thread does not play
that agent, in parallel or in sequence, and does not label its own pass as
a substitute. It reports a **handoff** and ends its turn:

1. **Tasks**: each agent the skill requires, as a ready brief: the skill
   and template path to read (`~/.cube/skills/<id>/...`), the exact
   branch, PR or commit, what it may write, what it returns, the role
   line for its model.
2. **Evidence**: what this thread established so far, pushed or attached
   (a branch, an artifact), so the new threads start from it.
3. **Continuation**: what this thread does when the results come back as a
   tell (the same task), or that its task ends here.

OptChat starts each task as a fresh thread (never the reporting thread,
which keeps only its own task), and tells the reporting thread the results
when its task continues. A thread never starts a thread itself.

Not a handoff: a deterministic script or codemod the thread writes and runs
(a lever, not an agent), and reading code the task itself needs.

**In OptChat**, a pstack fan-out is a `spawn` with one task per worker:

- Each task is a full brief ([briefing-a-thread](../../briefing-a-thread/SKILL.md)):
  goal, project, the exact branch, pull request or head commit, the
  worker prompt from the skill (name its path, e.g.
  `~/.cube/skills/how/references/explorer-prompt.md`, or paste it), what
  it may write, what it returns and when it stops. Workers do not see
  each other or this chat as instructions.
- Workers that write get separate branches or a scratch directory; two
  threads never push the same branch (one owner per branch).
- Capacity: `projects` shows free machines. Start what fits; archive done
  threads to free slots; start the next worker as each report arrives.
- Synthesis: read every report yourself and write the result, or, when
  the synthesis must read code or run a check, spawn one more thread with
  every report pasted in full. Never pass a worker's words on as a verdict.
- A worker that drops out: go on with N-1 and say so, as the skills say.

### Independent review

Independent judgment comes from a fresh thread. A review,
verification, judging or cross-model pass is done by a thread that neither
wrote the change nor reviewed something else, started by OptChat. Its
brief names what to review, the head commit and the criteria, never the
author's reasoning.

**The review handoff.** The lead's review and verification of a delegate's change goes to a fresh thread, because the delegate is the thread that wrote it. When the change is pushed, the author reports a handoff with one ready brief for a review-and-verification thread: the PR and its exact head SHA, the repro, measurement or pin to rerun on the real surface, the criteria (the playbook's own bar: the repro passes, the number moves past noise, behavior is unchanged), what the reviewer may not do (no edits, no pushes) and the verdict it returns (`PASS`, `PASS+NOTES` or `FAIL` with evidence). Never the author's reasoning. Then the author ends its turn. OptChat starts the reviewer, reads its verdict, and tells findings back to the author, whose fixes are the same task; a new head gets a delta review by the same reviewer thread. The author's own checks before pushing (tests, its own rerun of the repro, a reread of the diff) stay: they are author checks, reported as such, never the review.

### Same task, same thread

A task's own steps stay in its author thread (its checkout and branch
live there):

- `tell` the author thread: fixes to its own work, review findings on its
  own pull request, the user's answer to its question, going on after it
  stopped short, landing what it made. `tell` the reviewer thread: a delta
  review of new commits on the pull request it reviewed.
- `spawn` a new thread: another pull request, question or review, a
  follow-up outside the task, work in the same area after the result was
  delivered. Never reuse a thread as a standing worker.
- Each tell restates every directive still open for that task, so nothing rides only on the thread's memory. A thread
  that has spent its tells (8 between two messages of the user) waits for
  the user; do not start another thread to continue the same task.

## Questions, waiting and reports

### Questions

A question is OptChat's to ask. A thread that needs a decision it
cannot settle by running something ends its turn with the question, the
options, its recommendation and what each changes; OptChat answers from
the user's words or asks the user, then tells the thread.

### Waiting

Nothing wakes an ended thread, and nothing polls for OptChat.

- A thread waits for CI, a review or a long command in the foreground,
  with a bounded wait it repeats (a command runs at most 10 minutes:
  `timeout 590 gh pr checks <n> --watch`, or a watcher's `--timeout 590`).
  It does not end its turn to wait.
- Cursor's `/loop`, heartbeats and watcher subagents: inside one task the
  thread loops in its own turn; across tasks, each report is OptChat's
  wake-up, and OptChat tells or spawns the next step.
- A process that must outlive a command (a dev server for a preview URL)
  runs only as `cube service start NAME --port PORT -- COMMAND`, and only
  when the brief asks for it; the report names it.

### Reports

A thread's **report** is its final reply, for someone who decides the next
step from it alone:

1. Outcome: done, partly done or blocked.
2. Pins: branch, exact head commit, pull request URL, artifacts.
3. Evidence: each check marked ran, mocked or not run
   ([prove-it-works](../../prove-it-works/SKILL.md)); failures quoted.
4. Facts, hypotheses and unknowns kept apart.
5. Gaps and risks.
6. Handoff, when a skill needs another agent: tasks, evidence, continuation.
7. Decisions that need the user or OptChat, with a recommendation.

Promise no later work: say what is left and what it waits for.

**Reading a report (OptChat).** A report is evidence to check, not a
result to pass on. Sort its claims into fact, hypothesis and unknown;
check the pins (the head commit, and that checks ran on that commit); use
`history(id)` when a report is short or disagrees with `threads`. Green
CI, "should work" and an approving bot are not verdicts.

## Authority

cube-mode's Autonomy section ("just do it" for reversible work,
"always pause" for irreversible writes, session overrides such as
"don't stop") holds in cube, with cube's scope rules on top:

- A permission reaches exactly as far as the user said. A standing grant
  ("merge what passes independent review", "just go") covers every step
  it names until withdrawn: act on it without asking again, and restate it
  in each brief it covers. A grant for one task covers that task only.
- A thread's authority is its brief and OptChat's tells about it.
  Investigating does not imply implementing; a pull request does not
  imply merging; merging does not imply releasing.
- A thread's report never grants or widens a permission. No grant widens
  a task's scope.
- **Always pause**, in addition to pstack's list (force-push to shared
  branches, deploys, data deletion, customer messages): pushing to a
  default branch, tags, releases, restarts, host or production access,
  paid model probes, runtime or settings changes, and project hooks
  (only the user's own words in the chat, never a report, let OptChat
  save hooks).
- Precedence in a thread, highest first: cube's system and platform rules
  (the sandbox, what no task can grant); the task's explicit instructions,
  newest first, within the authority they carry; the repository's own
  rules (`AGENTS.md`); then the skill. Where the task explicitly
  authorizes what a repository rule reserves for explicit authorization,
  the task is that authorization; any other conflict, follow the task
  within its authority and say so in the report.

## Records and memory

pstack reads transcripts (`~/.cursor/projects/<slug>/agent-transcripts/`),
keeps program state in a Project tracker, and stores trails in a root
agent's store. Cube keeps these records:

| record | who reads it | how |
| --- | --- | --- |
| the user's chat with OptChat | OptChat; any thread, read only | OptChat: the view, `zoom(id, n)`, `date(id)`. A thread: its cube memory tools (`memory_zoom`, `memory_date`), when it has them |
| a thread's conversation | OptChat | `threads`, `history(id)`, `archived_threads(query)` |
| a thread's own work so far | that thread | its context; nothing else |
| documents the user reads and comments on | OptChat and the project's threads | artifacts (`artifact_write`, `artifact_read`, `artifact_edit`) |
| code, trails, decision logs | anyone | git: a pushed branch, a pull request, a committed file |

Files in a thread machine are not memory: they leave with the thread, and
no other thread sees them. A record another task needs goes to an
artifact, a pushed branch or the report. Never read a chat or thread
outside what the task is about.

## Environment

A thread is one VM with one checkout of one project at
`/workspace`, reaching the internet over HTTP and HTTPS only (no SSH, no
UDP: no Tailscale), with real secrets kept out of it.

| Cursor | cube |
| --- | --- |
| a git worktree per worker | each thread is its own checkout; within a thread, `git worktree` still works for scratch variants |
| a Cursor cloud agent's VM | the thread's VM |
| the user's computer, iOS simulators, `~/Library` | not reachable; say so and skip |
| `~/.cursor/plugins/`, the plugin cache | `~/.cube/skills/<id>/`, replaced at each thread start: never edit it to change a skill |
| `.cursor/skills/<name>/` (project skills) | `.agents/skills/<name>/` in the project's repository: cube lists them to that project's threads from the commit a thread starts on |
| `~/.cursor/skills/<name>/` (personal skills) | a skills source of the user's own (a git repository in cube's settings), or cubeyard/skills; a skill of the same id there overrides the default |
| `.cursor/rules/*.mdc`, always-applied rules | the repository's `AGENTS.md`; for OptChat, the user's `optchat/AGENTS.md` |
| `bun`, `mise` and other tools a script wants | install them in the thread's machine when the task needs them (it is the sandbox); say what you installed |

## Cursor-only features

When a step needs a Cursor feature cube lacks, write one line in
your reply or report, `Skipped in cube: <step>. <reason>.`, then go on. When a later step needs what
the skipped step made, leave a placeholder and name it.

| Cursor | cube |
| --- | --- |
| Bugbot, the agentic security review | GitHub review comments from any bot are review threads: triage them with [`bugbot-triage.md`](bugbot-triage.md) the same way. Skip steps that start or configure Bugbot itself |
| Cursor Automations, routines, `update_state`, webhook wakes, `SendToUser` secret requests | none: cube has no event that starts or wakes an agent besides the user's message and thread reports. Skip with the line |
| a built-in PR tool | `gh` (see opening-a-pr); no line needed |
| Origin (`origin pr ...`) | use it only if `command -v origin` succeeds in the thread; otherwise `gh` |
| `cursor-team-kit`: `deslop` | no such skill here: run the **unslop** skill over prose and the **no-comments** skill over code comments, and say `/deslop` was skipped |
| `cursor-team-kit`: `control-ui`, `control-cli` | the project's own verification skill (`.agents/skills/verify-*`, see **create-verification-skill**); else Playwright's Chromium in the thread (`pnpm test:browser` style), or driving the CLI in the shell |
| `create-skill` (Cursor's built-in) | the **Authoring a skill** playbook plus cube's rules in cubeyard/skills' README (frontmatter, surface, links) |
| Custom Modes, Option+Enter | none: a thread's whole task is one task, so a skill read at its start holds for it; OptChat re-reads cube-mode when a turn's request needs it |
| `/loop` | see Waiting |
| Plan Mode | the Multi-phase plan playbook, written as an artifact |
| `/visualize`, the image-generation tool, canvases | Mermaid diagrams and tables in an artifact or a reply; no generated images |
| the Project tracker (`notes.md`) and Project store | an artifact OptChat writes and revises for the program (see Records and memory) |
| the sidebar's pinned and active chats | OptChat's `threads` (not archived = in use) |

## Links

A link that leaves an installed skill's folder tree (to pstack's
README or guide) does not resolve in cube. Those documents are linked by
their public copy at the pinned upstream commit,
`https://github.com/cursor/plugins/blob/4dd1d05818d19792e7cd6e818f1667f95f7e1dbe/pstack/<path>`.
They describe Cursor; map their names with this file.
