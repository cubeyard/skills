---
name: recall
description: "Reconstruct your recent working context from your own chat history, live state, and the shared record (user reports, prior fixes, incidents), then hand back a tight current-state brief. Use for 'recall my work on X', 'catch me up', 'what have I been working on', 'where did I leave off', before starting or resuming work."
disable-model-invocation: true
---

# Recall

**Before you start or resume work, you rebuild the user's recent working context and hand back a tight capsule of where things stand now and what to do next.**

Keep it tight and on-topic. Read only what the in-scope threads need, then stop.

Your context lives in two records. Your own chat history holds what you did and decided. The shared record holds everything that happened around the same code under other names: the symptoms users keep reporting, the fixes that shipped and got reverted, the errors still firing in prod. That second record is what the **why** skill searches, across source control, the issue tracker, chat and issue channels, long-form docs, and error tracking. A feature with a long bug tail keeps most of its story there, so don't reconstruct it from your transcripts alone.

<!-- cube-adapt M10. Intent: your chat history is a set of transcript files, one per chat. Cube: in cube the user's history is one endless chat with OptChat plus the conversations of the threads OptChat started; OptChat reads both (view, zoom, date; threads, history, archived_threads); a thread reads only OptChat's chat, through its memory tools. Kept: two records, your history and the shared record, and the brief. Now: the history record is OptChat's chat and its threads' histories. Cost: a thread cannot read other threads' conversations; it asks for them in its report, or OptChat pastes them. -->
In cube your chat history is the user's one chat with OptChat (its view, `zoom(id, n)` and `date(id)`; a thread reads it read only through its memory tools) and the conversations of the threads OptChat started (`threads`, `history(id)`, `archived_threads(query)`, which only OptChat reads). Recall therefore starts in OptChat; a thread doing recall mines OptChat's chat and the shared record, and names the thread ids whose histories it could not read.

1. Classify, then route. One specific prior chat to resume is the `session-pickup` playbook, not this. Turning habits into a durable skill is `automate-me`. A human-readable summary of your work is a different task. Recall loads working context across recent chats before you act. If the user already gave you a full state capsule (paths, branch, the change), use it and skip the mining.
2. Lock the scope before searching. Pin the window ("recent" is a real range, default the last 7 days), the topic if named, and the workspace (default the active one. Never read another project's transcripts without being asked). State the scope back. Never quietly turn "all" into "recent N".
<!-- cube-adapt M2 M10. Intent: mine many chats in parallel, newest first, topic first, one schema per chat, raw text kept out of the deciding context. Cube: OptChat cannot start a reader for its own chat (threads can read it, though); the chat is one log with ids, not files; thread histories are a list OptChat reads. Kept: the window, topic-first reading, the per-item schema with citations, raw text out of the main context. Now: OptChat zooms its chat over the window (newest first) and reads the matching threads' histories; for a large window it spawns read-only threads that each mine a slice of the chat with their memory tools and return the schema; citations are message ids and thread ids. Cost: a thread's slice cannot include other threads' histories. -->
3. Mine your history over the window, newest first. OptChat: zoom into the lines on the topic and read `history(id)` of the threads they name; skip noise (evals, tests). For a large window, spawn read-only threads that each mine one id range of the chat with their memory tools. Each item gets the same schema, one block per thread or chat stretch: topic, the user's goal, decisions, open threads, struggles and corrections, and artifacts (PRs, tickets, branches, artifacts), each citing message ids or the thread id. Raw history stays out of your reply.
4. Sweep the shared record whenever the topic names a feature, file, subsystem, area, or bug. This is the default, not a judgment call, and "my work on X" does not exempt it. 
      <!-- cube-adapt M1 M2. Intent: the shared-record sweep runs beside the history mining. Cube: the why investigators need a machine: they are a thread (or threads) OptChat starts. Kept: the steered question, per-source playbooks and posture. Now: spawn the sweep alongside your own mining. Cost: none. -->
   Hand it to the **why** skill's source investigators (OptChat: in a thread it starts at once, beside its own mining), but steer their question from "why was this built this way" to "what's the current state, what's been tried and didn't hold, and what are users still reporting". Reuse its per-source playbooks and inherit its posture: one investigator per source, null results are findings, skip an unavailable source and say so. Fold what comes back into the brief. Skip this step only for pure activity recall with no named target ("what did I do this week"), where your own history and live state are the entire answer.
<!-- cube-adapt M1 M10. Intent: live state, not the chat's memory, says where things stand. Cube: OptChat cannot run git or gh; a thread can; OptChat reads a thread's full conversation with history(id). Kept: verify every surfaced PR, branch and ticket live. Now: a read-only thread checks them with git and gh (in OptChat's recall, spawn one with the list); history(id) for what an agent actually did. Cost: one short thread per recall that needs live state. -->
5. Verify against live state. Take the PRs, branches, and tickets that the mining and the sweep surfaced and check them with `git` and `gh` (OptChat: in one short read-only thread with the list). When the answer hinges on what an agent actually did (the tools it ran, files it read, errors it hit), read its full conversation (`history(id)`), not a summary.
6. Write the brief to the contract below. Group by thread. Stay on the named topic.

## Output contract

Lead with the capsule, then the thread status, then the problems, then the next move. Deeper detail goes below or gets cut.

- **Capsule.** At most 5 bullets. What this work is and where it stands overall.
- **Threads.** One line each, prefixed with exactly one status tag: `[merged #N]`, `[open PR #N]`, `[in flight <branch>]`, `[verified, uncommitted]`, `[reverted #N]`, or `[planned, not started]`. A thread with no tag is not done yet, so tag it.
- **Problems.** At most 5, the recurring ones. Include the symptoms users keep reporting and any fix that shipped and was reverted, so the next attempt starts where the last one failed.
- **Next move.** The single most useful next action, concrete.

An adjacent feature or ticket stays out unless it blocks this one. When the capsule and thread lines outgrow a screen, cut detail before you cut threads. Write the brief through the **unslop** skill, cite chat findings by message id or thread id and shared-record findings by their source (PR #, ticket ID, chat permalink, error-tracker issue), and sanitize private context before any public output.

**Reply:** the brief, to the contract above.
