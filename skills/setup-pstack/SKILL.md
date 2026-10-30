---
name: setup-pstack
description: Configure which models pstack uses per role and at what reasoning budget. Detects the models cube can run and writes the role lines OptChat follows when it starts threads. Use for /setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
alwaysApply: true
metadata:
  cube:
    surface: optchat
---

# Setup pstack

Write the pstack role block for the user's OptChat instructions file, `<CUBED_STATE>/optchat/AGENTS.md`, which OptChat reads on every request. You cannot write that file: build the block, and give it to the user to save between its two marker lines.

## Steps

### 1. Detect available models

Call `projects`: it lists the models a thread can run, as `provider/id`. That is the dependable source. If it lists none, ask the user which models they have. Never write a model you have not confirmed is available. The aliases `inherit-parent` and `auto` are always valid: both mean "omit `model`", so the thread runs on the host's preferred model.

### 2. Load current state

The default role list is the block shape in step 5 below. If your instructions already contain a `pstack models` block, treat its `# budget` line and its role values as the current choices. Otherwise start from the defaults, with every role on `inherit-parent`. A line whose role is not in step 5, such as `how critics`, is from a retired role. Drop it.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Ask in the chat with these four options, and name the current budget when the block records one. With no block, say that every role starts on the host's preferred model.

- `unlimited — strongest models`
- `large — strong models`
- `medium — balanced models`
- `small — cheapest models`

**(b) Apply it.** Build the working table from the defaults, and on a re-run keep any role you changed by family, list, or alias (`inherit-parent`, `auto`). For each role, pick among the detected models of the family the role names: the strongest for `unlimited`, the next for `large`, a mid-cost model for `medium`, the cheapest for `small`. A provider that lists reasoning levels as separate model ids gives you those as the steps. If the family has one model, the budget does not change it. `inherit-parent` and `auto` do not change.

**(c) Show the roles and confirm.** Show every role with its model, marking any model not in the detected set as needing a choice. Also list each line step 2 dropped. Ask whether to accept as-is or change specific roles, offering the detected models plus `inherit-parent` and `auto` (both mean: the host's preferred model). For panel roles (arena runners, architect runners, interrogate reviewers) the value is a list, and one thread runs per entry, alias entries included, so the list length sets the count. A panel is diverse only when its entries are different models: say so when they are not. `arena cross-judge pool` is also a list, but Arena runs one judge. It tries only values from a family other than your own model's, in list order, so order it by preference. An `inherit-parent` or `auto` value never judges. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every real model written must be in the detected set. `inherit-parent` and `auto` always pass. If a chosen model is not available, stop and ask again.

### 5. Write the rule

Give the user one block to put in `<CUBED_STATE>/optchat/AGENTS.md`, replacing any earlier block between the same marker lines, with a `# budget` line with the chosen label and one line per role, using the same labels cube-mode uses. Shape (put a detected `provider/id` where it says `<judgment model id>`):

```
<!-- pstack models -->
# pstack model configuration. One line per role. Delete a line to fall back to the host's preferred model.
# `inherit-parent` or `auto` as a value: omit spawn's model, so the thread runs on the host's preferred model. Alias entries in a panel list still count toward its fan-out.
# budget: large
feature, refactoring: inherit-parent
bug-fix: inherit-parent
perf-issue: inherit-parent
hillclimb: inherit-parent
judgment and prose: <judgment model id>
hardest tasks: <judgment model id>
how explorer: inherit-parent
how explainer: <judgment model id>
why investigators: inherit-parent
why synthesizer: <judgment model id>
reflect tooling: inherit-parent
reflect judgment, divergent, synthesizer: <judgment model id>
arena runners: <judgment model id>, inherit-parent
arena cross-judge pool: <judgment model id>, inherit-parent
swarm workers: inherit-parent
architect runners: <judgment model id>, inherit-parent
interrogate reviewers: <judgment model id>, inherit-parent
<!-- /pstack models -->
```

### 6. Confirm

Tell the user where to save the block, that it applies from your next request once saved (to threads started after that, never to running ones), and that re-running this skill updates it.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill in its `.agents/skills`, or an existing harness), as far as you know from its threads' reports. If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, start a thread for it (`~/.cube/skills/create-verification-skill/SKILL.md`). On no, move on without pushing.

### 8. Offer a formal verification skill (optional)

Check whether the project already has a formal verification skill (a project skill that runs a model checker, a proof, or another verifier against the code). If not, offer once: "want a formal verification skill, so agents can prove a key property of your code holds in every case in scope, not only the cases tests reach? I can generate one with /create-formal-verification-skill." On yes, start a thread for it (`~/.cube/skills/create-formal-verification-skill/SKILL.md`). On no, move on without pushing.
