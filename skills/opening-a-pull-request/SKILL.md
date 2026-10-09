---
name: opening-a-pull-request
description: Branch, commit and open a GitHub pull request from a cube thread, with a short body a reviewer can read in a minute. Use when the task ends in a pull request.
---

# Opening a pull request

1. Start from the latest default branch: `git fetch origin` and branch from
   `origin/<default>`, unless the task names another base.
2. Make small commits that each tell one step. Follow the repository's own
   commit rules (its `AGENTS.md`, `CONTRIBUTING.md`) over this skill.
3. Before you push, verify the change as
   [prove-it-works](../prove-it-works/SKILL.md) describes.
4. Push the branch and run `gh pr create`. Write the body from
   [body.md](body.md).
5. Report the pull request's URL and the exact head commit
   (`git rev-parse HEAD`).

Never push to the default branch, merge, tag or release unless the task
says so explicitly. Opening a pull request does not authorize merging it.
