---
name: reflect
description: Run three review lenses over the session (threads OptChat starts), surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
disable-model-invocation: true
---

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## 1. Locate the active transcript

In cube: a thread writes a tight digest of its own session from its context (the transcript file is out of its reach) to `/tmp/reflect/digest.md`, with the opening request quoted. OptChat reflecting on a thread reads `history(id)`, and on its own chat uses `zoom`. Read nothing outside this conversation. Never glob across other projects' or threads' records.

## 2. Run three reviewers (threads OptChat starts)

OptChat: one `spawn` call with three threads, each with its template and the digest or the pasted history, models from the user's preferences for the roles below, matched per the Models section of `../briefing-a-thread/SKILL.md` (ask when none covers a role). 
A thread: write the digest, push or attach it, and report a handoff with the three reviewer briefs and the synthesizer brief (`../cube-mode/references/cube.md`, Handoff); end your turn.

| Lens | Role | `model` | Prompt template |
|---|---|---|---|
| Judgment | `reflect judgment, divergent, synthesizer` | the user's preference (Models) | `references/judgment-reviewer.md` |
| Tooling | `reflect tooling` | the user's preference (Models) | `references/tooling-reviewer.md` |
| Divergent | `reflect judgment, divergent, synthesizer` | the user's preference (Models) | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings in their report (or lens file).

## 3. Synthesize

OptChat: one synthesizer thread, `model` from the `reflect judgment, divergent, synthesizer` line, with every reviewer's report inlined. Pass `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. It returns an Accepted / Rejected / Backlog list.

## 4. Structural enforcement check

Move any Accepted item that a lint rule, script, metadata flag, or runtime check would enforce more reliably to Backlog. See the **encode-lessons-in-structure** principle skill.

## 5. Apply

Present the synthesizer's full Accepted / Rejected / Backlog output and wait for explicit approval before applying any Accepted edit (a thread: report it and end your turn; the approval comes back as a tell). The user picks the subset and may redirect routings. Skill changes affect every future agent. Do not auto-apply.

File each Backlog item to the tracker the brief names (a GitHub issue, say) without waiting; with none named, list it in your report. Only the Accepted list waits for approval.

Never edit a skill under `~/.cube/skills/` (cube replaces it at every thread start). Before approval, show its destination: the project's `.agents/skills/<skill>/` (that project's threads) or the user's own skills source (every project; same id overrides cube's default). After approval, copy the skill folder there and edit the copy on a branch, and open a PR. Never merge it.

Follow each approved row's Routing exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): the parent does it directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): run cube-mode's **Authoring a skill** playbook (`../cube-mode/playbooks/authoring-a-skill.md`).
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): rewrite its description by the same playbook, and check whether it is listed at all (a `disable-model-invocation: true` skill is matched by nobody; it is reached only by a link).
- `new skill via create-skill: <kebab-name>`: write it by the same playbook. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done.

## 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
