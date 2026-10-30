---
name: poteto-help
description: Guides users through pstack setup, /cube-mode, and picking the skill, playbook, or principle for a task. Use only when the user types /poteto-help or asks for pstack help by name.
# cube-adapt M5. Intent: help loads only when the user asks for it by name. Cube: a hidden skill is listed to nobody, so neither OptChat nor a thread could reach it. Kept: the narrow description. Now: listed to both. Cost: a loose match may load it.
metadata:
  cube:
    surface: both
---

# Poteto help

Answer the user's question about pstack, hand them a prompt they can send, and link the file the answer came from. For a help question, don't start the work. The user asked how, and a pstack run spends real tokens, so let them send the prompt.

<!-- cube-adapt M5 M12 M13. Intent: route work to poteto-mode, and give the user links they can open. Cube: cube has no Custom Modes; installed skills are under ~/.cube/skills (or read with skill() in OptChat); the guide and README are not installed, and the adapted skills' public copy is cubeyard/skills. Kept: routing work to poteto-mode and public links. Now: skills link to cubeyard/skills; the guide and README to cursor/plugins at the pinned commit, with a note that they describe Cursor. Cost: the guide's Cursor wording stays; references/cube.md maps it. -->
A message that asks for work, such as "use pstack to fix this bug", is not a help question. Read [`cube-mode`](../cube-mode/SKILL.md) and do the work under it.

This file maps questions to the skills and guide pages that hold the answers. Those files own the details. Read the file you route to before you quote it, and trust it when it disagrees with this map. The user may not be able to open the installed copies, so give the user a public copy: a skill at `https://github.com/cubeyard/skills/blob/main/skills/` followed by its path, and pstack's README and guide at `https://github.com/cursor/plugins/blob/4dd1d05818d19792e7cd6e818f1667f95f7e1dbe/pstack/` followed by their path. The guide describes Cursor; map its names with [`../cube-mode/references/cube.md`](../cube-mode/references/cube.md).

## Find out what they need

Infer the need from the message and the conversation. A named situation, such as "which skill reviews a PR?", goes straight to its section. If the need is still unclear, ask one multiple-choice question with these options, then answer only the section they pick:

- Get set up
- Start a task with `/cube-mode`
- Pick a skill for a situation
- Fix a run that went wrong
- Make pstack my own

Check the state that changes the answer, and mention it only when it does:

<!-- cube-adapt M4 M11. Intent: the answer depends on whether models are configured and the project has a harness. Cube: the role lines live in OptChat's instructions; project skills live in `.agents/skills`. Kept: both checks. Now: those places. Cost: a thread cannot see OptChat's instructions; it says the check is OptChat's. -->
- No `pstack models` block in OptChat's instructions means `/setup-pstack` hasn't run for this user, so every role runs on the host's preferred model. Only OptChat can see that block.
- No `verify-*` skill in the project's `.agents/skills` or other app harness means agents have no scripted way to drive the app. Mention `/create-verification-skill` when the question is about proving a change works.
- No formal verification skill in the project means no property is checked past what tests reach. Mention `/create-formal-verification-skill` when the question is about a race, an invariant, or another case tests rarely hit. When one exists and the code it covers changed after the commit it records as last in sync, mention `/maintain-formal-verification-skill` if the question touches that code.

When the model rule is missing and it matters, ask whether the user wants to pick a model for each role and a reasoning budget now. It matters when the user is new, the question is about setup or cost, or the answer depends on which models run. Ask at most once per chat. If the need is also unclear, ask both questions together. Offer two choices:

- Now: give them `/setup-pstack` to type, and answer their question too.
- Later: answer their question, and add one line saying every role keeps its default model until they run `/setup-pstack`.

## Get set up

<!-- cube-adapt M5 M10 M13. Intent: install, configure models, start a task. Cube: cube installs skills from cubeyard/skills at a pinned commit (Settings, Skills, check for update); setup-pstack produces a block the user saves; four skills are listed, the rest load by link. Kept: the three steps and the note about what loads by itself. Now: cube's install and listing. Cost: none. -->
1. In cube, pstack ships in cube's default skills (cubeyard/skills). New threads get the commit chosen in Settings, Skills (check for update, then use that commit); a running thread keeps the skills it started with.
2. Run [`/setup-pstack`](../setup-pstack/SKILL.md) in OptChat. It asks for a budget, maps a model to each role, and hands you a block to save in OptChat's instructions file. It applies from OptChat's next request. Then it offers once each to generate a verification skill and a formal verification skill for the project, unless the project already has one.
3. Start a real task with `/cube-mode`, a goal, and a check that can pass or fail.

Only four skills are listed for the model to load from the user's words: `cube-mode`, `poteto-help`, `setup-pstack` (OptChat) and `typescript-best-practices` (threads). The others are installed but load only when cube-mode routes to them or the user names them. The [README](https://github.com/cursor/plugins/blob/4dd1d05818d19792e7cd6e818f1667f95f7e1dbe/pstack/README.md) and [guide page 1](https://github.com/cursor/plugins/blob/4dd1d05818d19792e7cd6e818f1667f95f7e1dbe/pstack/docs/guide/01-setup.md) have the Cursor details. Offer to word their first prompt with them, per [`references/prompting.md`](references/prompting.md).

<!-- cube-adapt M2 M4 M12. Intent: explain cost and where pstack runs. Cube: in cube the extra cost is extra threads (each a machine and a model context); OptChat's usage tool reports it; Cursor and Claude Code installs do not apply here. Kept: cost advice and the harness note. Now: threads and role lines; references/cube.md is cube's adapter. Cost: none. -->
If cost is the worry, say where the tokens go and how to spend fewer. pstack spends extra tokens, and machines, on extra threads and review panels; OptChat's `usage` shows the cost so far. Rerun `/setup-pstack` and pick a smaller budget or cheaper models. A role set to `auto` or `inherit-parent` runs on the host's preferred model. A shorter panel list starts fewer threads, one for each entry. Save `/cube-mode` for work that needs rigor.

pstack is built for Cursor. In cube, [`../cube-mode/references/cube.md`](../cube-mode/references/cube.md) maps every Cursor name: OptChat starts the threads that pstack's subagents were, and a step that needs a Cursor-only feature, such as Bugbot or Automations, is skipped with a one-line note. Upstream's [Claude Code adapter](https://github.com/cursor/plugins/blob/4dd1d05818d19792e7cd6e818f1667f95f7e1dbe/pstack/docs/harness/claude-code.md) is the model it follows.

## Start a task with `/cube-mode`

<!-- cube-adapt M1 M5 M13. Intent: how the mode starts and stays on. Cube: cube has no Custom Modes; OptChat reads the mode when a request asks for it, and passes it to threads by naming it in their briefs; a thread keeps it for its whole task. Kept: what the mode does and how to prompt it. Now: say "/poteto-mode" (or "use poteto-mode") in the message to OptChat or the thread; OptChat briefs its threads with the poteto-agent preamble. Cost: OptChat must be asked again on a later unrelated turn. -->
`/cube-mode` matches the task to a playbook, copies the playbook's steps into the todo list, and runs the other skills as the steps need them. A step it skips stays in the list as `skip: <reason>`. A good prompt states the goal and how to tell it's done. It doesn't list skills, because a hand-written sequence tends to drop or reorder steps the playbook would keep. Read [`references/prompting.md`](references/prompting.md) before you help word one. [Guide page 2](https://github.com/cursor/plugins/blob/4dd1d05818d19792e7cd6e818f1667f95f7e1dbe/pstack/docs/guide/02-cube-mode.md) has examples.

In cube, how `/cube-mode` stays on:

- In a message to OptChat, `/cube-mode` (or "use cube-mode") makes OptChat work in it for that request and name it in the brief of every thread it starts for it ([`../cube-mode/agents/poteto-agent.md`](../cube-mode/agents/poteto-agent.md)).
- A thread whose brief names it keeps it for its whole task.
- There are no Custom Modes: on a later, unrelated request, say it again.

Mid-chat, "new task" makes the mode match a fresh playbook.

## Pick a skill

The default answer is `/cube-mode`, which runs most of the others when its steps need them. Name a skill directly when the user wants more or less of something than the playbook gives. Read the skill before you recommend it, and give one example prompt.

<!-- cube-adapt M5 (rename). Intent: point at pstack's router by its name. Cube: the router is renamed cube-mode (the user's option B). Kept: what the text routes to. Now: /cube-mode and cube-mode. Cost: none. -->

| The user wants to | Skill |
|---|---|
| Do any non-trivial task with rigor | [`/cube-mode`](../cube-mode/SKILL.md) |
| Check that the agent understood their goal and the problem before it starts | [`/in-your-own-words`](../in-your-own-words/SKILL.md) |
| Get a prompt rewritten deeper, not bigger, before sending it: what a top professional would add, their raw material and methods, and an outside check. It returns the prompt and doesn't do the task | [`/sharpen`](../sharpen/SKILL.md) |
| Know how code works now, or where new code should live | [`/how`](../how/SKILL.md) |
| Know why code is shaped this way, or where a number came from | [`/why`](../why/SKILL.md) |
| Understand a change or subsystem, explained plainly | [`/teach`](../teach/SKILL.md) |
| Catch up on their own recent work on a topic | [`/recall`](../recall/SKILL.md) |
| Catch up on what changed in this chat since their last message, in plain words and small visuals, with every item waiting on them listed and decidable from the reply alone | [`/ketchup`](../ketchup/SKILL.md) |
| Catch up like `/ketchup`, in a short subtitled video of slides, with the waiting calls as text under it | [`/ketchup-video`](../ketchup-video/SKILL.md) |
| Know what a small diff could break outside itself | [`/blast-radius`](../blast-radius/SKILL.md) |
| Settle types and module shape before code that crosses a function boundary | [`/architect`](../architect/SKILL.md) |
| Get several attempts at one brief, merged into the best one | [`/arena`](../arena/SKILL.md) |
<!-- cube-adapt M2. Intent: the swarm row. Cube: workers are threads. Kept: the row. Now: the words. Cost: none. -->
| Run parallel checks over slices, or race workers, as threads | [`/swarm`](../swarm/SKILL.md) |
| Have different models review a diff and try to break it | [`/interrogate`](../interrogate/SKILL.md) |
| Fix a bug test-first when a cheap local test exists | [`/tdd`](../tdd/SKILL.md) |
| Apply TypeScript rules to `.ts` or `.tsx` work | [`/typescript-best-practices`](../typescript-best-practices/SKILL.md) |
| Strip comments before review, using a reviewer that didn't write them | [`/no-comments`](../no-comments/SKILL.md) |
| Clean AI tells out of prose | [`/unslop`](../unslop/SKILL.md) |
| Write docs, an RFC, a README, a PR description, or a commit message to a standard | [`/technical-writing`](../technical-writing/SKILL.md) |
| Hear the last reply again in plain words | [`/bro`](../bro/SKILL.md) |
| Give agents a scripted way to drive the app and prove behavior | [`/create-verification-skill`](../create-verification-skill/SKILL.md) |
| Bring a verification skill and its feature map back in line with the app | [`/maintain-verification-skill`](../maintain-verification-skill/SKILL.md) |
| Formally verify a race, invariant, or other property that tests rarely reach | [`/create-formal-verification-skill`](../create-formal-verification-skill/SKILL.md) |
| Bring a formal verification back in line after the code it covers changed, and learn whether a failure is drift or a bug | [`/maintain-formal-verification-skill`](../maintain-formal-verification-skill/SKILL.md) |
| Show a PM or designer what the user sees as a chart checked by a TLA+ model, with the shortest path to each state that breaks a rule | [`/statechart`](../statechart/SKILL.md) |
| Vet a performance number before reporting or acting on it | [`/benchmark-checklist`](../benchmark-checklist/SKILL.md) |
| Run a large or cross-cutting change, or one to review after stepping away | [`/figure-it-out`](../figure-it-out/SKILL.md) |
| Keep a decision log during a run, and review it afterward | [`/show-me-your-work`](../show-me-your-work/SKILL.md) |
| Pick a model for each role and a reasoning budget | [`/setup-pstack`](../setup-pstack/SKILL.md) |
| Turn their own working habits into a personal mode skill | [`/automate-me`](../automate-me/SKILL.md) |
| Turn what a finished task taught into skill edits | [`/reflect`](../reflect/SKILL.md) |
| Stop agents from repeating the same mistakes in this repo | [`/correct`](../correct/SKILL.md) |
<!-- cube-adapt M12. Intent: the bot UI row. Cube: cube has no webhook that wakes an agent. Kept: the row and the skill. Now: say what the skill can still do in cube. Cost: none. -->
| Build a page whose buttons wake an agent over a webhook (in cube: the page only; no webhook wakes a cube agent yet) | [`/make-bot-ui`](../make-bot-ui/SKILL.md) |
| Find their way around pstack | `/poteto-help` |

If a skill directory next to this one is missing from the table, read its frontmatter and route by its description. The `principle-*` directories are covered under principles below.

Close calls:

- `/how` explains what the code does. `/why` explains the reasons. `/teach` runs one or both and explains the result plainly.
- `/arena` gives every worker the same brief and merges the best parts. `/swarm` splits work into slices or a race and returns one report.
- `/architect` implements right after it settles the design. Add "with checkpoint" to review the design before it writes code.
- `/interrogate` reviews the diff. `/blast-radius` looks for breakage outside the diff and proves the one fact that makes the change safe.
- `/recall` rebuilds context across recent chats. `/ketchup` covers only this chat since the user's last message. Resuming one specific chat or branch is the Session pickup playbook.
- `/figure-it-out` designs one rigorous run. The Orchestrate playbook runs a program that spans days and many PRs. The Autonomous run playbook drives one task to a finish condition.

Not in pstack:

<!-- cube-adapt M12. Intent: say what pstack does not ship. Cube: none of these is in cube. Kept: the list. Now: add what stands in for each in cube. Cost: none. -->
- `/deslop`, `control-cli`, and `control-ui` ship in the `cursor-team-kit` plugin, which cube does not have (see the Cursor-only table in `../cube-mode/references/cube.md`).
- `/loop` and `/create-skill` are Cursor built-ins, not in cube.
- pstack has no `/orchestrate` skill. Orchestrate is a `/cube-mode` playbook. If the slash menu shows `/orchestrate`, another plugin provides it.

## Playbooks and principles

Playbooks are step lists inside `/cube-mode`, not skills, so they have no slash command. Inside `/cube-mode`, describing the task picks one, and these phrases name one directly:

- "babysit this pr" or "check on pr 123" runs Babysit. It drives the PR to merge-ready and stops there. It doesn't merge unless the user asks to merge, land, or ship.
- "land the stack" runs Shipping.
- "take over this branch" runs Session pickup.
- "pause safely" runs Pause safely.
- "full autopilot on this queue" runs Autopilot-full. "autopilot, don't merge" runs Autopilot-stack.
- "run the eval playbook" runs Eval.

<!-- cube-adapt M12 M13. Intent: playbooks are named through the mode; planning has a home. Cube: cube has no built-in babysit skill and no Plan Mode; the guide is not installed. Kept: the routing. Now: pinned guide links; plans are the Multi-phase plan playbook. Cost: none. -->
The Playbooks section of [`cube-mode`](../cube-mode/SKILL.md) lists every playbook, when it applies, and whether OptChat or a thread runs it. [Guide page 6](https://github.com/cursor/plugins/blob/4dd1d05818d19792e7cd6e818f1667f95f7e1dbe/pstack/docs/guide/06-verify-and-ship.md) covers opening, babysitting, and landing a PR.

pstack has no planning skill, and cube has no Plan Mode. For work that spans phases or stacked PRs, asking `/cube-mode` for a plan runs the [Multi-phase plan playbook](../cube-mode/playbooks/multi-phase-plan.md), which writes the plan and doesn't implement it. For a design question, the Prototype playbook or `/architect` settles it in code first.

<!-- cube-adapt M5 M13. Intent: principles load on demand by name. Cube: principle skills are hidden in cube; an agent reaches them by path. Kept: steering by name. Now: naming one makes the agent read `~/.cube/skills/principle-<name>/SKILL.md`. Cost: none. -->
Principles are one-rule skills that `/cube-mode` reads and cites in its replies. The user rarely invokes one. They steer with the names instead, as in "apply prove it works. show me the real output." Naming `/principle-<name>` makes the agent read `~/.cube/skills/principle-<name>/SKILL.md`. [Guide page 8](https://github.com/cursor/plugins/blob/4dd1d05818d19792e7cd6e818f1667f95f7e1dbe/pstack/docs/guide/08-principles.md) lists them.

## Fix a run that went wrong

| Symptom | Fix |
|---|---|
<!-- cube-adapt M5 M7 M11. Intent: symptoms map to cube's causes. Cube: cube's modes, model choice, isolation and overnight runs work differently. Kept: every symptom row. Now: cube's cause and fix in each changed row. Cost: none. -->
| The mode stopped applying after a few turns | OptChat reads it per request: say `/cube-mode` again on a new request. A thread keeps it for its task when its brief names it. |
| A question got treated as the next step of the last task | Say "new task", or say the turn doesn't need the mode. |
| A new model choice had no effect | The block from `/setup-pstack` must be saved in OptChat's instructions file, and applies to threads started after that; running threads keep their model. |
| Runs cost more than expected | See the cost paragraph under Get set up. |
| A skill didn't load on its own | Only the four listed skills load from the user's words (see Get set up). The others load when the user names them or when `/cube-mode` runs them, and it doesn't run every skill. |
| Parallel agents overwrote each other | Each thread has its own machine; give each its own branch, and never two writers on one branch. |
| An overnight run moved but finished nothing | A run needs a check that can pass or fail, not a duration. See [guide page 7](https://github.com/cursor/plugins/blob/4dd1d05818d19792e7cd6e818f1667f95f7e1dbe/pstack/docs/guide/07-overnight.md). |
| The reply claims success from a green build | Ask for the real command, flow, stored value, or profile. That's the prove-it-works principle. |

<!-- cube-adapt M13. Intent: point at more steers. Cube: the guide is not installed. Kept: the pointer. Now: the pinned public copy. Cost: none. -->
For a run that drifts, [`references/prompting.md`](references/prompting.md) has one-line steers. [Guide page 10](https://github.com/cursor/plugins/blob/4dd1d05818d19792e7cd6e818f1667f95f7e1dbe/pstack/docs/guide/10-recipes-and-pitfalls.md) has more pitfalls and the recipes worth copying.

## Make pstack my own

- [`/automate-me`](../automate-me/SKILL.md) drafts a personal mode skill from the user's own history, to use alongside `/cube-mode`.
- [`/reflect`](../reflect/SKILL.md) after a session turns its lessons into skill edits the user approves.
- `/cube-mode write a skill for <workflow>` runs the authoring playbook. The eval playbook tests a skill change blind.
<!-- cube-adapt M11 M13. Intent: fix skills in their own PR. Cube: a skill's source is cubeyard/skills, the user's own skills source, or the project's .agents/skills. Kept: the rule. Now: name those places; pinned guide link. Cost: none. -->
- Fix a misbehaving skill in its own PR, in its source (cubeyard/skills, your own skills source, or the project's `.agents/skills`), not inside the feature work where it went wrong.

[Guide page 9](https://github.com/cursor/plugins/blob/4dd1d05818d19792e7cd6e818f1667f95f7e1dbe/pstack/docs/guide/09-make-it-yours.md) covers each of these.

## Reply

Lead with the answer. Give at most one example prompt in a code block, adapted from [`references/recipes.md`](references/recipes.md) when one fits, then the link to that file. Keep it short unless the user asked for the whole map.
