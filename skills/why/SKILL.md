---
name: why
description: "Use for 'why does X work this way', 'why we picked Y', design rationale, regressions, postmortems, or data-backed thresholds. Discovers available MCPs and queries each evidence category (source control, issue tracker, long-form docs, real-time chat, infrastructure observability, error tracking, product analytics warehouse) in parallel, then returns a cited read on decisions and tradeoffs. Use how for runtime behavior."
disable-model-invocation: true
---

# Why

Investigate the motivation and intent behind code. The companion `how` skill answers what the code does and how it works. `why` answers what forces led to its shape.

<!-- cube-adapt M2 M4 M11. Intent: one investigator per evidence source in parallel, each keeping its tools, then a separate synthesizer that follows the epistemics framework. Cube: a thread cannot spawn and has no MCP servers beyond cube's own (artifacts, OptChat's memory); OptChat can spawn but has no machine. Kept: one pass per source, null results as findings, the separate synthesis, the confidence language. Now: a thread runs each investigator as its own pass writing to a scratch file, then the synthesizer pass; OptChat spawns the investigators as threads (role line `why investigators`) and one synthesizer thread (`why synthesizer`) with the findings pasted. Cost: in a thread the synthesizer is the same model that investigated, so its spot-checks are weaker; say so. -->
**In a thread** (no spawns), run each investigator below as its own pass that writes its findings to `/tmp/why-<slug>/<source>.md`, then the synthesizer as a last pass that reads only those files, the anchor and the epistemics framework. **In OptChat**, each investigator and the synthesizer is a thread, read only, on the `why investigators` and `why synthesizer` role lines. Investigators never write anything.

## Operating Posture

Operate as a **careful, cautious, and precise investigator**. Be honest about what you know vs what you're inferring. Read `references/epistemics.md` for the full confidence framework and phrasing guide. The synthesizer must follow it.

## Step 1. Understand the Target and the Question

The **target** is usually a chunk of code, a pattern, a feature, or a named design decision. The **question** is usually a design rationale, a tradeoff, a motivating edge case, an external constraint, dead code, or a broad history sweep.

<!-- cube-adapt M10. Intent: read the referent from context. Cube: a thread has no editor cursor; its context is the brief and OptChat's chat. Kept: best guess, stated. Now: the brief and the chat. Cost: none. -->
If the target is vague ("why do we do it this way?" with no clear referent), make your best guess from context (the brief, recent edits, what OptChat's chat was discussing). State your interpretation briefly so the user can redirect if you're off, then proceed.

## Step 2. Establish the Code Anchor

Before spawning investigators, build the seed context inline: file paths and line ranges, key symbols (functions, classes, constants), the last few commits touching the target, PR numbers from merge commits (pattern `(#1234)` in the subject line), and any linked ticket IDs. Run `git blame -L <start>,<end> <file>` for last-touch commits, `git log --follow -p -- <file>` for full history with patches through renames, `git log --oneline -20 -- <file>` for recent commits with PR numbers visible, and `git log -1 --format=%B <commit>` to extract PR numbers. Then pull the PR bodies and discussion for any substantive commit: `gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews`. This anchor goes to every investigator and to the synthesizer.

## Step 3. Spawn Parallel Investigators

**Default to the full parallel investigation.** The goal is a complete coverage map, not a minimal one. Document the null, don't skip the search.

### Discovery

<!-- cube-adapt M10 M11. Intent: find every evidence source the environment really has. Cube: a cube thread's tools are git, gh, HTTP(S) and cube's own: OptChat's chat with the user (read only, with the memory tools) and the project's artifacts; no other MCP servers unless the brief names one. Kept: discovery before spawning, and the seven categories. Now: the user's chat with OptChat counts as real-time team chat, artifacts as long-form documents, GitHub issues as the tracker; the rest are gaps unless a tool for them exists. Cost: most categories are gaps in cube; the coverage map says so. -->
Before starting investigators, list the evidence sources this thread really has. In cube that is git and `gh` (source control, and GitHub Issues as a tracker), the user's chat with OptChat (read only, through your memory tools: it is the team's real-time deliberation), the project's artifacts (long-form documents, with `artifact_read`), and any further tool the brief names. Treat each as its MCP below.

Map each available MCP to one evidence category:

1. Source control history
2. Issue / ticket tracker
3. Long-form documents
4. Real-time team chat
5. Infrastructure observability
6. Error / exception tracking
7. Product analytics warehouse

Source control is always available through git and `gh`. For the other six, classify using the MCP name, server instructions, tool names, and resource descriptors. If an MCP could fit more than one category, choose the one matching its primary evidence. Record ambiguous cases in the coverage map.

<!-- cube-adapt M2 M4. Intent: one investigator per source, concurrently, each owning one source. Cube: only OptChat spawns. Kept: one pass per source, never one pass over several. Now: a thread runs one pass per source; OptChat spawns one thread each on the `why investigators` line. Cost: none. -->
Run one investigator per category that has a matching source, each owning exactly one source: OptChat spawns them in one call on the `why investigators` line; a thread runs one pass per source. Don't let one pass cover several sources.

Each investigator's prompt is `references/investigator-prompt.md` filled in, plus:
<!-- cube-adapt M10. Intent: each source has a playbook. Cube: cube adds one for OptChat's chat. Kept: the rule. Now: name it. Cost: none. -->
- the category playbook `references/sources/<source>.md` for the selected MCP, adapted from the examples in `references/source-playbook.md` (for the user's chat with OptChat: `references/sources/optchat-chat.md`)
- `references/sources/incident-postmortem.md` **if the target code looks defensive** (null checks, retry logic, timeout handling, rate limiting, feature flags, egress guards, OOM handlers)
- the code anchor and the user's original question

### Investigator roster, one per available evidence category

Each category below is uniquely positioned to surface one shape of "why", shown after "Best at". Use it to know what to expect back, to name a gap when a category returns empty, and, only in the rare provably-irrelevant case, to justify a skip.

1. **Source control** (git history, `gh` for PRs, code comments, tests). Always spawn, the only guaranteed source. Best at *implementation-time rationale captured during review*.
2. **Issue / ticket tracker** (e.g. Linear, Jira, GitHub Issues, Plane, Shortcut MCP). Best at *the product or business forcing function*. Strongest when the why is external to engineering.
3. **Long-form documents** (e.g. Notion, Confluence, Google Docs, Coda MCP). Best at *long-form design rationale*, written out before it becomes code.
4. **Real-time team chat** (e.g. Slack, Discord, Microsoft Teams, Mattermost MCP). Best at *real-time deliberation that never reached a doc*. Especially important when the source control, ticket, and doc paper trail is thin.
5. **Infrastructure observability** (e.g. Datadog, New Relic, Honeycomb, Grafana, Splunk MCP). Best at *infrastructure and runtime reality that motivated the code*. Strongest when the target reacts to an infra signal (timeouts, retries, rate limits, circuit breakers).
6. **Error / exception tracking** (e.g. Sentry, Rollbar, Bugsnag, Airbrake MCP). Best at *the specific exceptions and error trajectories that motivated defensive or corrective code*. Strongest for catch blocks, null guards, type checks, retries, and other defenses.
7. **Product analytics warehouse** (e.g. Databricks, Snowflake, BigQuery, ClickHouse, dbt, Redshift MCP). Best at *product and data reality that shaped the code*. Strongest for flag-gated code, experiment-driven ships, data migrations, and "where did this number come from" questions.

### When to skip an investigator

Only with an **explicit, written justification** that goes in the final Sources Consulted. Two valid reasons:

- **No MCP is available for that category** in this environment. Flag it as a gap, not a choice: "Real-time team chat skipped. No matching MCP available, so the conversational record was not searchable."
- **The source is provably irrelevant**, not just "probably irrelevant." A high bar: "Error / exception tracking skipped. Target is a build-time script with no runtime code path."

If your scope assessment suggests a single-commit trivial target where the PR description already contains the complete answer, you may answer inline **only after** confirming all seven available category searches would be redundant. Say so explicitly. This should be rare.

## Step 4. Synthesize

<!-- cube-adapt M2 M4. Intent: a separate synthesizer on a judgment model. Cube: only OptChat spawns. Kept: a separate synthesis with these inputs. Now: OptChat spawns it on the `why synthesizer` line; a thread runs it as a last pass over the files. Cost: none. -->
Run one synthesizer (OptChat: a thread on the `why synthesizer` line; a thread: a last pass). It gets:
1. The investigator findings, including any null results and any categories skipped with justification
2. The code anchor
3. The user's original question
4. The epistemics framework from `references/epistemics.md`
5. The synthesizer prompt template from `references/synthesizer-prompt.md`

## Step 5. Present

Present the synthesizer's output to the user. You may lightly edit for clarity or add context from the conversation, but **do not rewrite the confidence language**.

## Output Format

The structure is the one in `references/synthesizer-prompt.md`: The Question, The Code in Question, What We Found, What We Can Reasonably Infer, Competing Hypotheses, What We Don't Know, Sources Consulted, Confidence Summary. Adapt as needed, but keep the confidence separation intact, and keep Sources Consulted as one line per investigator, including the ones that returned nothing or were skipped, with the reason.

After Sources Consulted, if the user's `why` question is a precursor to changing this code, convert the lineage findings into a Preserve / Change / Avoid / Risk constraint set for planning the change.

## Common Failure Modes to Avoid

- **Recency bias**. Assuming the most recent commit is authoritative. The current shape is often the accretion of many earlier decisions. Trace back.
