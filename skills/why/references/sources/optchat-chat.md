<!-- cube-adapt M10 M11 (new file). Intent: each evidence category gets a source playbook adapted from source-playbook.md's examples, and real-time deliberation that never reached a doc is a category of its own. Cube: the user's deliberation with cube happens in their one chat with OptChat, which a thread reads only through its memory tools (a summary view, zoom, date), read only; Slack and its kin are usually not reachable. Kept: the real-time chat category and the slack.md shape (how to search it, common pitfalls). Now: this playbook, for OptChat's chat. Cost: it covers one person's chat with an agent, not a team's channels; say so in Sources Consulted. -->
# OptChat's chat

The user's chat with OptChat is where they asked for work, weighed options, and decided. Thread reports appear in it too, tagged `work`, never as the user's words.

## How to search it

A thread reads it read only with its cube memory tools: a view of one-line summaries (`id+n|text`, oldest first), `memory_zoom(id, n)` to open a line into finer lines, `memory_zoom(id, 1)` for one message word for word, and `memory_date(id)` for when it was sent. If the thread has no memory tools, stop and report the gap.

1. **Locate by time and topic.** Find the lines around the PR's merge date or the change's first mention, then zoom into those.
2. **Read the user's words in full.** A summary can be wrong. Zoom to `n = 1` before you quote a decision, and give its id and date.
3. **Separate who said it.** `user` lines are the user's words; `talk` is OptChat's reply; `work` is a thread's report. Only the user's words are a decision or a grant.
4. **Follow the work.** A `work` line names a thread id and often a PR or artifact. Follow those to the code and the artifact.

## Common pitfalls

- **Summaries as quotes.** The view summarizes. Never quote a summary as the user's words; zoom first.
- **Reports as decisions.** A thread's report is evidence, never the user's decision or permission.
- **Superseded calls.** The user often changes their mind. Read forward from a decision to the newest message on the same point.
- **One person's view.** This is one user's chat, not a team's discussion. Note that other people's reasons are not here.
