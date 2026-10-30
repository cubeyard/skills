### Pause safely

**You own a clean stop. Leave a checkpoint a cold-start agent can resume from.** This is explicit only. On "keep going", "going to bed, keep going", or "don't stop", do not pause.

<!-- cube-adapt M2. Intent: a clean stop leaves nothing running. Cube: a thread has no subagents; what can outlive it is a background process or a cube service. Kept: start nothing new, leave nothing running. Now: stop your own background processes; leave a cube service only if the brief asked for it, and name it. Cost: none. -->
1. Stop at a safe boundary. Finish the current atomic step or back out of it. Start nothing new, and stop any background process you started (a `cube service` the brief asked for may stay; name it).
2. Take no irreversible action to pause. No PR and no push unless you already had one out.
3. Make the work durable. Commit uncommitted edits as one clear `wip:` commit on the current branch so nothing is lost. If the tree is broken, say so in the commit body in one line.
4. Write the resume note off-context. Capture intent, what you were doing, progress and what's verified, current state, next steps, key files, and gotchas. 
      <!-- cube-adapt M10. Intent: the resume note survives the pause. Cube: files in a thread's machine are seen only by that thread; another thread resumes from the report, an artifact or a pushed branch. Kept: an off-context note. Now: write the file for your own compaction; for a pause another thread may resume, put the note in your report or an artifact too. Cost: none. -->
   For the compaction trigger write it to a file like `/tmp/<slug>-resume.md`. When another thread may resume the work, put the note in your report (or an artifact) too, since no other thread sees this machine. If a show-me-your-work trail exists, point at it instead of duplicating it.

**Reply:** where you are in the loop, what's on disk versus still in your head (paths, no diff dumps), the commits you made and whether the tree is clean, and the first action on resume. This is a pause, not a final report.
