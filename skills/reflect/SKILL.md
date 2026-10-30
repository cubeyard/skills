---
name: reflect
description: Run three review lenses over the session (threads OptChat starts, or passes in a thread), surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
# cube-adapt M2. Intent: three independent reviewers over the transcript. Cube: only OptChat starts threads. Kept: three lenses, routed edits. Now: the description names both forms. Cost: none.
disable-model-invocation: true
---

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

<!-- cube-adapt M10. Intent: reviewers read the real transcript of this conversation, never other projects' chats. Cube: a thread cannot read its own transcript file (its agent runs outside the machine); OptChat reads a thread's conversation with history(id); upstream already allows a tight digest when the transcript cannot be found. Kept: this conversation only, and the digest fallback. Now: in a thread, write the digest from your context to a file; in OptChat, read the thread's history(id) (or your own chat with zoom) and pass a digest or the pasted pages. Cost: a digest is the author's view of its own session; say so in the findings. -->
## 1. Locate the active transcript

In cube: a thread writes a tight digest of its own session from its context (the transcript file is out of its reach) to `/tmp/reflect/digest.md`, with the opening request quoted. OptChat reflecting on a thread reads `history(id)`, and on its own chat uses `zoom`. Read nothing outside this conversation. Never glob across other projects' or threads' records.

<!-- cube-adapt M2 M10. Intent: find the transcript file among Cursor's layouts and run three reviewers in parallel. Cube: cube has no transcript files a thread can read, and only OptChat starts reviewers. Kept: the digest fallback and three lenses. Now: the Cursor layout commands are left in upstream/ only; the heading names both forms. Cost: none. -->
## 2. Run three reviewers (threads in OptChat, passes in a thread)

<!-- cube-adapt M2 M3 M4. Intent: three lenses read the session independently, each on its role's model, with tools to check what the transcript cites. Cube: only OptChat starts reviewers (threads, model from the role lines); a thread runs the lenses itself. Kept: three lenses, verbatim templates, the role lines. Now: OptChat spawns three threads with the templates and the digest; a thread runs the three lenses as passes, each writing to its own file before the next starts. Cost: a thread's lenses share one model and one memory of the session; label them self-review. -->
OptChat: one `spawn` call with three threads, each with its template and the digest or the pasted history, models from the role lines below (omit `model` where a line is missing or says `auto` or `inherit-parent`). A thread: run the three lenses yourself, one pass each, each writing its findings to `/tmp/reflect/<lens>.md` before the next begins, and label them `self-review, not independent`.

<!-- cube-adapt M4. Intent: each lens has a role line and a default model. Cube: Cursor slugs are not cube model ids; a role with no line runs on the host's preferred model. Kept: the lenses, role lines and templates. Now: the default column says so. Cost: none. -->
| Lens | Role line | Default `model` | Prompt template |
|---|---|---|---|
| Judgment | `reflect judgment, divergent, synthesizer` | the host's preferred model | `references/judgment-reviewer.md` |
| Tooling | `reflect tooling` | the host's preferred model | `references/tooling-reviewer.md` |
| Divergent | `reflect judgment, divergent, synthesizer` | the host's preferred model | `references/divergent-reviewer.md` |

<!-- cube-adapt M7. Intent: findings come back to the parent. Cube: a thread returns findings in its report. Kept: verbatim templates. Now: reports (or the lens files). Cost: none. -->
Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings in their report (or lens file).

## 3. Synthesize

<!-- cube-adapt M2 M4. Intent: a separate synthesizer on the judgment model verifies citations and sorts findings. Cube: only OptChat spawns. Kept: the template and its three lists. Now: OptChat spawns a synthesizer thread with every reviewer report pasted; a thread runs the synthesis as a last pass over the lens files. Cost: none. -->
OptChat: one synthesizer thread, `model` from the `reflect judgment, divergent, synthesizer` line, with every reviewer's report inlined. A thread: a last pass over the lens files. Pass `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. It returns an Accepted / Rejected / Backlog list.

## 4. Structural enforcement check

Move any Accepted item that a lint rule, script, metadata flag, or runtime check would enforce more reliably to Backlog. See the **encode-lessons-in-structure** principle skill.

## 5. Apply

<!-- cube-adapt M6 M9 M11. Intent: nothing changes a skill without the user's approval, the installed copy is never edited, and edits land in a place every later agent reads. Cube: a thread asks only by ending its turn; installed skills (~/.cube/skills) are replaced at every start; cube reads skills only from git commits (the project's .agents/skills, or a skills source in settings), so an edit reaches later threads only through a branch that gets merged. Kept: approval before any Accepted edit, never the installed copy, a named destination, Backlog filed without waiting. Now: report the lists and end your turn; after approval, copy the skill to the destination repository and open a PR there (never merge it); Backlog goes to the tracker the brief names, else into the report. Cost: upstream's "never open a PR or push" becomes "open a PR, never merge": the merge is the gate that local-only editing gave. -->
Present the synthesizer's full Accepted / Rejected / Backlog output and wait for explicit approval before applying any Accepted edit (a thread: report it and end your turn; the approval comes back as a tell). The user picks the subset and may redirect routings. Skill changes affect every future agent. Do not auto-apply.

File each Backlog item to the tracker the brief names (a GitHub issue, say) without waiting; with none named, list it in your report. Only the Accepted list waits for approval.

Never edit a skill under `~/.cube/skills/` (cube replaces it at every thread start). Before approval, show its destination: the project's `.agents/skills/<skill>/` (that project's threads) or the user's own skills source (every project; same id overrides cube's default). After approval, copy the skill folder there and edit the copy on a branch, and open a PR. Never merge it.

Follow each approved row's Routing exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): the parent does it directly.
<!-- cube-adapt M12. Intent: substantive edits and new skills follow an authoring loop, not ad-hoc shape. Cube: create-skill is not installed. Kept: a structured authoring pass. Now: cube-mode's Authoring a skill playbook; a description that did not trigger is tuned against cube's listing (only listed skills are matched by description). Cost: no automated description-optimization loop. -->
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): run cube-mode's **Authoring a skill** playbook (`../cube-mode/playbooks/authoring-a-skill.md`).
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): rewrite its description by the same playbook, and check whether it is listed at all (a `disable-model-invocation: true` skill is matched by nobody; it is reached only by a link).
- `new skill via create-skill: <kebab-name>` (the synthesizer's label, kept from upstream): write it by the same playbook. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done.

## 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
