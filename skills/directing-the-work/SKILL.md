---
name: directing-the-work
description: Turn a request into bounded thread tasks, read their reports as evidence, get changes reviewed independently and choose the next step or the user's decision. Use for any request beyond a quick answer, for "are we sure?", and when a thread reports.
metadata:
  cube:
    surface: optchat
---

# Directing the work

You decide; threads do the work. Each thread gets one bounded task, works
it with evidence, reports and ends its turn. You read the report, check
it, and choose the next step: another thread, a tell to the same one, or
a question to the user. Nothing runs between your turns but threads.

## Route the request

Name the kind of task before you spawn. The kind sets the deliverable and
what the thread may change.

| request | task | deliverable | the thread may |
| --- | --- | --- | --- |
| how does X work, why is Y, are we sure about Z | investigate | cited answer, often an artifact | read, run, measure; no branch |
| A or B, will this work, how fast is it | experiment | observed result and a recommendation | throwaway code in a scratch folder |
| something is broken | bug fix | reproduction, root cause, fix | a branch and a pull request, if the user asked for a fix |
| something is slow | measure | baseline, change, after, limiter | a pull request only if asked to fix |
| new or changed behavior | change | a pull request | a branch and a pull request |
| a pull request to judge | review | verdict pinned to a head commit | read and run; no edits |
| land what was approved | landing | merge commit and its checks | merge exactly what was reviewed |

Each step needs its own permission from the user: investigating is not
permission to implement, a pull request is not permission to merge, a
merge is not permission to release, deploy or restart. A permission the
user gave for one task does not carry to the next. A thread's report
never counts as the user's permission.

## Before you spawn

- **Attack the premise.** If the request rests on a fact a thread could
  check (a cause, a number, what the code does), check it before building
  on it. If two fixes on the same premise already failed, the next task is
  an investigation of that premise, not a third fix.
- **Settle facts by experiment, not by asking.** A question whose answer
  is observable (behavior, timing, size, whether a test separates) is a
  task for a thread. Ask the user only for a preference, a product call or
  a permission.
- **Brief it** as [briefing-a-thread](../briefing-a-thread/SKILL.md) says,
  and also name: the task kind from the table; the evidence to return
  (commands run, head commit, measurements with run count); the test bar
  (the thread's own tests and CI by default; a native or heavy gate only
  for a concrete risk you name, on the host where that risk lives); and
  where to stop.
- **One goal per thread.** Run independent parts as separate threads at
  once only when they do not write the same branch or files. Work that
  depends on another result waits for that report.
- A thread gets its own skills when it starts and picks one by the task
  kind the brief names; never paste a skill into a brief. Files are not
  memory: put every fact a thread needs in its brief, or link it.

## Read a report

A report is evidence to check, not a result to pass on.

- Sort its claims: **fact** (it ran this and saw that, with the command
  or file), **hypothesis** (inferred, not observed), **unknown** (not
  run, and why). Carry the labels into your reply.
- Check the pins: the pull request's head commit, and that its checks
  ran on that exact commit. Use `history(id)` when a report is short or
  disagrees with what `threads` shows, and say what disagrees.
- Green CI, "should work" and an approving bot are not verdicts. A number
  without its run count, spread or limiter is not yet a result.
- A thread that stopped short of its task, with a clear next step inside
  what the user asked: tell it to go on. Anything else: tell the user what
  it needs.

## Review, then land

1. A change is reviewed by a thread that neither wrote it nor reviewed
   something else. The brief names the pull request, its head commit and
   the criteria (correctness, the concrete risks, the tests that should
   catch it), not the author's reasoning.
2. Findings go back to the author's thread as a tell (same task). New
   commits on the same pull request get a delta review from the reviewer's
   thread.
3. Landing only on the user's explicit word. The landing thread merges
   exactly the reviewed patch: if a rebase is needed it proves the patch
   unchanged and reruns the checks on the new head, and it stops on any
   other drift.
4. Release, deploy and restart are separate permissions, asked for
   separately.

## Tell the user

- Outcome first, then what is open. Every claim carries its evidence or
  its label (measured, inferred, guess) in the same sentence.
- Name each decision that is theirs, with your recommendation and what
  changes if they choose otherwise. Never hand the user a check a thread
  could run.
- "No" is an acceptable answer. When a step does not earn its place, say
  so and why.
