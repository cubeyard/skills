# cube skills

The default skills for [cube](https://github.com/cubeyard/cube) threads. Each
folder under `skills/` is one skill in the [Agent Skills](https://agentskills.io)
format: a `SKILL.md` with `name` and `description` frontmatter, plus any files
it links with relative paths.

cube pins this repository to an exact commit; a cube release moves the pin.
A thread's prompt lists each skill's name and description only. The agent
reads a `SKILL.md`, and the files it links, when a task needs them.

## Working in cube

Two skills carry cube's way of working, adapted from
[poteto-mode](https://github.com/cursor/plugins/tree/main/pstack/skills/poteto-mode) for cube's split between
OptChat and threads:

- `directing-the-work` (OptChat): route a request to bounded thread
  tasks, read reports as evidence, have changes reviewed independently and
  choose the next step or the user's decision.
- `working-the-task` (threads): work the one assigned task evidence first,
  inside its scope and permissions, report facts, hypotheses, unknowns and
  gaps, and end the turn. Its `playbooks/` hold one short procedure per
  task kind.

Neither starts subagents or keeps a standing worker: OptChat starts
threads, and each thread hands back to OptChat.

## Surface

`metadata.cube.surface` says which agent gets a skill:

| value | who |
| --- | --- |
| `thread` (default) | a thread's agent (Pi or Claude Code) |
| `optchat` | OptChat, which reads it with its `skill` tool (not listed to threads) |
| `both` | both |

```yaml
---
name: briefing-a-thread
description: ...
metadata:
  cube:
    surface: optchat
---
```

## Rules

- The folder name is the skill name: lowercase letters, digits and inner
  hyphens, at most 64 characters. A description is at most 1024 characters.
- Plain files only: no symlinks or submodules.
- Link other skills as `../<name>/SKILL.md`. cube installs every skill as
  `~/.cube/skills/<name>/`, so these links keep working, and a user's
  override of `<name>` is what the link reaches.

To change a skill for your own cube without forking, add a source of your
own with a skill of the same name; see cube's `docs/skills.md`.
