# cube skills

The default skills for [cube](https://github.com/cubeyard/cube) threads. Each
folder under `skills/` is one skill in the [Agent Skills](https://agentskills.io)
format: a `SKILL.md` with `name` and `description` frontmatter, plus any files
it links with relative paths.

cube pins this repository to an exact commit; a cube release moves the pin.
A thread's prompt lists each skill's name and description only. The agent
reads a `SKILL.md`, and the files it links, when a task needs them.

## pstack

Most skills here are [pstack](https://github.com/cursor/plugins/tree/main/pstack),
poteto's agent workflow stack, ported from Cursor to cube: 57 of its 58
skills with their references and scripts. `setup-pstack` is retired, since
cube needs no model setup: OptChat follows the model preference the user
states in the chat (`skills/cube-mode/references/cube.md`, M4). Start from
`cube-mode` (pstack's `poteto-mode`) or `cube-help` (pstack's
`poteto-help`), both renamed for cube and listed to OptChat and threads;
the other pstack skills are installed but hidden, and cube-mode routes to
them. OptChat takes pstack's lead role
(routing, briefing, judging, landing order) and threads do its execution;
`skills/cube-mode/references/cube.md` maps every Cursor name, and no skill
asks a thread to start another agent.

`upstream/pstack/` is the unmodified original, which cube never installs.
[PORTING.md](PORTING.md) explains the method, the mapping rules and the gaps;
[COVERAGE.md](COVERAGE.md) lists every upstream file and where it went.
Installed skills read as plain instructions: the reasons for each change live
in PORTING.md and git history, not in `skills/`. Check the port with:

```sh
node scripts/check-port.mjs
```

cube's own skills are `briefing-a-thread` (OptChat), `opening-a-pull-request`
and `prove-it-works` (threads).

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
- A ported pstack skill keeps upstream's text except where cube needs a
  change; explain the change in PORTING.md, never in the installed file.
  `scripts/check-port.mjs` refuses adaptation notes and mapping-rule labels
  (M1-M13) under `skills/`.
- Link other skills as `../<name>/SKILL.md`. cube installs every skill as
  `~/.cube/skills/<name>/`, so these links keep working, and a user's
  override of `<name>` is what the link reaches.

To change a skill for your own cube without forking, add a source of your
own with a skill of the same name; see cube's `docs/skills.md`.
