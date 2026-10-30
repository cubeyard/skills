---
name: automate-me
description: "Use for \"automate me\", \"create/update/refresh my -mode skill\", \"turn/capture my preferences or working style into a skill\", or wanting agents to follow how the user works. Drafts or revises a personal -mode skill via create-skill + unslop, optionally pulling fresh evidence from recent transcripts."
disable-model-invocation: true
---

# Automate me

A guided flow for turning the user's working conventions into a skill agents will follow. The output is one `-mode` skill tailored to them (e.g. `jay-mode`, `priya-mode`).

<!-- cube-adapt M1 M12. Intent: a guided flow over mining, authoring and prose skills. Cube: create-skill is not installed; mining the user's history is OptChat's (it reads the chat and its threads); writing the skill needs a machine and git. Kept: the flow and its guardrails. Now: OptChat mines and interviews; a thread drafts and opens the PR; poteto-mode's Authoring a skill playbook stands in for create-skill. Cost: the flow crosses OptChat and a thread once. -->
This skill orchestrates three others: an inline mining pass (see step 1), an authoring pass (poteto-mode's **Authoring a skill** playbook; Cursor's `create-skill` is not in cube), and the **unslop** skill (prose discipline). It sequences them. It doesn't replace them. In cube, OptChat runs steps 0 to 3 and gives steps 4 to 6 to one thread with the findings and the user's answers in its brief.

## Flow

### 0. Check for an existing skill

<!-- cube-adapt M6 M11. Intent: find an existing mode skill wherever skills live, and confirm intent. Cube: cube's skill locations are the project's .agents/skills and the skills sources in settings; only OptChat asks the user, in plain text. Kept: the search and the confirmation. Now: look in the installed skills (`~/.cube/skills/*-mode`, OptChat: its skill list), the project's `.agents/skills/`, and the user's skills source; ask in the chat. Cost: none. -->
Look for a `*-mode` skill matching the user's handle in the installed skills (a thread: `~/.cube/skills/*-mode/SKILL.md`; OptChat: its skill list and `skill(...)`), the project's `.agents/skills/**/*-mode/`, and the user's own skills source. If one exists, confirm intent in the chat (unless they already said "update my skill" or similar):

- Update the existing skill (default for repeat runs)
- Start fresh (rare, ask why before doing it)

Update mode changes the rest of the flow:
- Step 1 mines only history since the skill was last edited (`git log -1 --format=%cI <path>`).
- Step 2 asks what's changed or missing, not what to capture from zero.
- Step 4 edits the existing file in place. Preserve sections the user hasn't contradicted. Revise ones with new evidence. Add new sections only for genuinely new rules.

### 1. Mine their history

<!-- cube-adapt M2 M10. Intent: mine recent history in parallel slices, inside the user's own scope. Cube: the history is OptChat's chat and its threads' conversations; OptChat reads them, and read-only threads can mine slices of the chat with their memory tools. Kept: slices, cross-checking across slices, the signal list, scope. Now: OptChat mines (zoom by date range, history of the threads it finds), or spawns one read-only thread per slice of the chat's id range. Cost: threads cannot read other threads' histories; OptChat covers those itself. -->
In cube the history is the user's chat with OptChat and the conversations of the threads it started. Use only those.

Survey recent conversations for recurring patterns, in slices of history (e.g. last 2-4 weeks, split into 3 slices so each has enough material): OptChat zooms each date range and reads the histories of the threads it names, or spawns one read-only thread per slice of the chat with its memory tools. Each slice miner reads only its slice, looks for the signals below, and returns a short structured list of patterns it saw with evidence pointers. Default signals worth hunting:

- Response preferences (length, tone, format, "dumb it down" corrections)
- Delegation habits (subagents, models, specialized workflows, parallelism)
- Verification posture (what "done" means, unit tests vs live repro, reviewers)
- Code and prose discipline (style, principles cited, lint/format tools)
- Process conventions (worktrees, commits, PRs, review/merge tooling)
- Meta preferences (fixing skills mid-task, proposing new ones)

Cross-check across slices before elevating a signal. Patterns seen in 2+ slices are high-confidence. Lone signals are weak and usually get dropped.

### 2. Ask the user directly

<!-- cube-adapt M6. Intent: a structured multi-choice interview. Cube: AskQuestion does not exist; OptChat asks in the chat. Kept: few questions, 4-6 options, multi-select for categories, one free-form question at the end. Now: numbered options in plain text the user answers in their own words. Cost: no clickable options. -->
Mining misses intent that hasn't come up yet. Ask in the chat (OptChat) with numbered options, rather than asking the user to type from scratch.

Shape: one or two questions with 4-6 options each, saying when several may be picked for category questions. Start broad ("Which areas matter most?"), then follow up on selected areas with specific options. After the structured rounds, one free-form chat question catches anything the options missed.

Don't dump 20 questions.

### 3. Cluster findings

Group the combined signals into sections. Common ones (use only what applies):

- **Response style**: length, tone, format.
- **Autonomy**: how much to do without asking, MCP tool use.
- **Understand first**: which skills to reach for when scoping or investigating a change.
- **Subagents**: default, parallelism, model-to-task, specialized workflows.
- **Prose / code discipline**: principles, lint tools, style guides.
- **Review and verify**: repro posture, verification skills, live-testing tools.
- **Process**: git worktrees, commits, PRs, review/merge tooling.
- **Skills**: skill-authoring habits, fix-the-skill-first, proposing new skills.

The **poteto-mode** skill shows the shape. Read it for granularity. Don't copy its content. The user's rules are not the same as poteto-mode's.

### 4. Draft the skill

<!-- cube-adapt M5 M11 M12. Intent: author with the host's skill tooling and place the mode where it applies. Cube: create-skill is not installed; a cube skill folder is one level deep (`<path>/<id>/SKILL.md`, the folder name is the id), in the project's .agents/skills or in a skills source repository. Kept: keep an existing location; project by default, personal on request. Now: poteto-mode's Authoring a skill playbook; `.agents/skills/<handle>-mode/` in the project, or `<handle>-mode/` in the user's own skills source for every project. Cost: no category subdirectories: cube reads only `<path>/<id>/`. -->
Author the skill with poteto-mode's **Authoring a skill** playbook. Placement:

- Path: preserve an existing mode skill's location. For a new mode, default to `.agents/skills/<handle>-mode/SKILL.md` in the project (that project's threads list it), or `<handle>-mode/SKILL.md` in the user's own skills source if the user wants it in every project. Cube reads only `<path>/<id>/SKILL.md`, so no category subfolders.
- Handle: the user's first name or chosen identifier.
- Frontmatter `description`: trigger on their name + `/<handle>-mode` + "work in their style", not on generic keywords like "write code" or "review PR".
<!-- cube-adapt M5. Intent: the mode loads only when asked for. Cube: in cube a `disable-model-invocation: true` skill is listed to nobody, so nobody could ask for it; the description is the only trigger. Kept: load only on request. Now: leave the field out, keep the description triggering only on the user's name and `/<handle>-mode`, and set `metadata.cube.surface: both` so OptChat can brief threads with it. Cost: a loose description may load it uninvited. -->
- Frontmatter formatting: keep `description` as one YAML scalar. Quote it or use `description: >-` with indented continuation lines when punctuation or wrapping requires it.
- Frontmatter: in cube, leave `disable-model-invocation` out (a hidden skill is listed to nobody), and keep the description narrow (the user's name, `/<handle>-mode`, "work in their style") so it loads only on request. Add `metadata.cube.surface: both` so OptChat can work in it and name it in briefs.

### 5. Iterate on prose

<!-- cube-adapt M6 M12. Intent: iterate the draft with the user. Cube: the drafting thread reaches the user through its report; create-skill is not installed. Kept: iterations with the user. Now: the thread reports the draft (an artifact the user can comment on) and ends its turn; OptChat brings the feedback back as tells. Cost: each iteration is a round trip. -->
Apply the **unslop** skill and the Authoring a skill playbook's writing rules to every line.

Show the draft to the user (an artifact they can comment on) and take feedback. Expect multiple iterations. Cut ruthlessly. A mode skill is not a manual.

### 6. Land it

<!-- cube-adapt M11. Intent: land through review, never straight to main. Cube: the thread works in its own checkout. Kept: a PR, never main. Now: a branch in the thread's checkout of the destination repository. Cost: none. -->
Work on a branch off main in the destination repository. Commit and open a PR. Don't push to main directly.

## Guardrails

- **Don't overfit to one conversation.** A preference stated once and contradicted another time is noise. Require multiple instances before codifying it.
- **Don't be clever.** Restating other skills' contents, inventing metaphors, or writing "poetic" prose for an agent reader is cost without benefit. Keep it operational.
- **Reference, don't inline.** Other skills the user relies on should appear as path references, not pasted excerpts. Same for any principle docs they maintain elsewhere.
- **Keep sections minimal.** Only add a section if the user has a specific, non-default rule there. "Communicate clearly" is not a section. "Short paragraphs. Tables when comparing options. Bullets only when items are genuinely parallel." is.
- **Name conventions generic.** Use "the user" or "the human" in imperatives, not the author's first name.
- **Don't force symmetry.** If a user has no process rules worth writing down, skip the Process section entirely.

## Evaluation

<!-- cube-adapt M12. Intent: name the loop not to run. Cube: create-skill is not installed. Kept: no benchmark loop. Now: the words. Cost: none. -->
A `-mode` skill is subjective output. A test/iterate benchmark loop isn't useful here. Vibe-check with the user: does it read like them? Did it miss anything? Then ship.

Run a description-optimization loop only if the skill's trigger accuracy turns out to be a problem in practice.

## When not to use

<!-- cube-adapt M12. Intent: route task skills elsewhere. Cube: create-skill is not installed. Kept: no mining. Now: the Authoring a skill playbook. Cost: none. -->
- User wants a task-specific skill (not working conventions): poteto-mode's Authoring a skill playbook alone, no mining required.
- User wants to capture one narrow workflow (e.g. "how I write commit messages"). That's a regular skill, not a mode skill.

